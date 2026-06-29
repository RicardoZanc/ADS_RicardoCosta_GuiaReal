import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../lib/errors/BaseError";
import { dispatchN8nReportWebhook } from "../../lib/n8nReportWebhook";
import {
  assertCanReport,
  assertNoExistingReport,
  assertValidReportReason,
  loadReportTarget,
  type ReportTargetType,
} from "./reports.domainRules";
import type {
  CreateReportInput,
  ListReportsQuery,
  UpdateReportInput,
} from "./reports.schema";

function toIsoString(date: Date | null | undefined): string {
  return (date ?? new Date(0)).toISOString();
}

async function findLinkedFactIds(
  targetType: ReportTargetType,
  targetId: string
): Promise<string[]> {
  const evidence = await prisma.fact_evidence.findMany({
    where:
      targetType === "opinion"
        ? { opinion_id: targetId }
        : { interaction_id: targetId },
    select: { fact_id: true },
  });

  return [...new Set(evidence.map((row) => row.fact_id))];
}

async function applyTargetModeration(
  targetType: ReportTargetType,
  targetId: string,
  status: "RESOLVED" | "REJECTED"
): Promise<void> {
  if (targetType === "opinion") {
    await prisma.opinions.update({
      where: { id: targetId },
      data:
        status === "RESOLVED"
          ? { is_hidden: true }
          : { reports_locked: true },
    });
    return;
  }

  await prisma.discussion_threads.update({
    where: { id: targetId },
    data:
      status === "RESOLVED"
        ? { is_hidden: true }
        : { reports_locked: true },
  });
}

const create = async (reporterId: string, input: CreateReportInput) => {
  assertValidReportReason(input.reason);

  const target = await loadReportTarget(input.target_type, input.target_id);
  assertCanReport(reporterId, target);
  await assertNoExistingReport(reporterId, target.targetType, target.targetId);

  const report = await prisma.reports.create({
    data: {
      reporter_id: reporterId,
      reason: input.reason,
      status: "PENDING",
      ...(target.targetType === "opinion"
        ? { target_opinion_id: target.targetId }
        : { target_interaction_id: target.targetId }),
    },
    select: {
      id: true,
      reason: true,
      status: true,
      created_at: true,
      target_opinion_id: true,
      target_interaction_id: true,
    },
  });

  const factIds = await findLinkedFactIds(target.targetType, target.targetId);
  if (factIds.length > 0) {
    dispatchN8nReportWebhook({
      report_id: report.id,
      source_type: target.targetType,
      source_id: target.targetId,
      reason: input.reason,
      fact_ids: factIds,
    });
  }

  return {
    id: report.id,
    target_type: target.targetType,
    target_id: target.targetId,
    reason: report.reason,
    status: report.status,
    created_at: toIsoString(report.created_at),
    linked_fact_count: factIds.length,
  };
};

const list = async (query: ListReportsQuery) => {
  const { page, limit, status } = query;
  const skip = (page - 1) * limit;

  const where = status ? { status } : {};

  const [reports, total] = await Promise.all([
    prisma.reports.findMany({
      where,
      orderBy: { created_at: "asc" },
      skip,
      take: limit,
      select: {
        id: true,
        reason: true,
        status: true,
        admin_notes: true,
        created_at: true,
        reviewed_at: true,
        target_opinion_id: true,
        target_interaction_id: true,
        users: {
          select: { id: true, username: true },
        },
        reviewer: {
          select: { id: true, username: true },
        },
        opinions: {
          select: {
            id: true,
            title: true,
            content: true,
            is_hidden: true,
            reports_locked: true,
            users: { select: { id: true, username: true } },
          },
        },
        discussion_threads: {
          select: {
            id: true,
            content: true,
            is_hidden: true,
            reports_locked: true,
            users: { select: { id: true, username: true } },
          },
        },
      },
    }),
    prisma.reports.count({ where }),
  ]);

  return {
    data: reports.map((report) => {
      const targetType: ReportTargetType = report.target_opinion_id
        ? "opinion"
        : "thread";
      const target =
        targetType === "opinion" ? report.opinions : report.discussion_threads;

      return {
        id: report.id,
        reason: report.reason,
        status: report.status,
        admin_notes: report.admin_notes,
        created_at: toIsoString(report.created_at),
        reviewed_at: report.reviewed_at
          ? toIsoString(report.reviewed_at)
          : null,
        reporter: report.users,
        reviewer: report.reviewer,
        target: {
          type: targetType,
          id:
            report.target_opinion_id ?? report.target_interaction_id ?? "",
          title:
            targetType === "opinion"
              ? (report.opinions?.title ?? null)
              : null,
          content: target?.content ?? "",
          is_hidden: target?.is_hidden ?? false,
          reports_locked: target?.reports_locked ?? false,
          author: target?.users ?? null,
        },
      };
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

const update = async (
  reportId: string,
  reviewerId: string,
  input: UpdateReportInput
) => {
  const report = await prisma.reports.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      status: true,
      target_opinion_id: true,
      target_interaction_id: true,
    },
  });

  if (!report) {
    throw new NotFoundError("Denúncia não encontrada");
  }

  if (report.status === "RESOLVED" || report.status === "REJECTED") {
    throw new BadRequestError("Denúncia já foi finalizada");
  }

  const targetType: ReportTargetType = report.target_opinion_id
    ? "opinion"
    : "thread";
  const targetId =
    report.target_opinion_id ?? report.target_interaction_id ?? "";

  if (!targetId) {
    throw new BadRequestError("Denúncia sem alvo válido");
  }

  if (input.status === "RESOLVED" || input.status === "REJECTED") {
    await applyTargetModeration(targetType, targetId, input.status);
  }

  const updated = await prisma.reports.update({
    where: { id: reportId },
    data: {
      status: input.status,
      admin_notes: input.admin_notes,
      reviewer_id: reviewerId,
      reviewed_at: new Date(),
    },
    select: {
      id: true,
      status: true,
      admin_notes: true,
      reviewed_at: true,
      target_opinion_id: true,
      target_interaction_id: true,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    admin_notes: updated.admin_notes,
    reviewed_at: toIsoString(updated.reviewed_at),
    target_type: targetType,
    target_id: targetId,
  };
};

export const reportsService = {
  create,
  list,
  update,
};
