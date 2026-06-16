/** Profundidade máxima em que o recuo horizontal continua aumentando. */
export const MAX_INDENT_DEPTH = 4;

/** Classes compartilhadas para linhas verticais conectoras entre níveis. */
export const THREAD_CONNECTOR_CLASS = "border-l border-accent/30";

/** Recuo horizontal aplicado por nível, até MAX_INDENT_DEPTH. */
export const THREAD_INDENT_CLASS = "ml-5 pl-3";

export function getThreadLevelClass(depth: number): string {
  const classes = ["min-w-0", THREAD_CONNECTOR_CLASS];

  if (depth <= MAX_INDENT_DEPTH) {
    classes.push(THREAD_INDENT_CLASS);
  } else {
    classes.push("pl-3");
  }

  return classes.join(" ");
}
