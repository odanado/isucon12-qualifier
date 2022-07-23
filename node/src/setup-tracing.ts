import tracer, { Tracer } from "dd-trace";
import { execSync } from "child_process"

export function setupDatadog(): Tracer {
  const currentCommitHash = execSync("cd ~/webapp/node/; git show -s --format=%ci HEAD").toString().trim()
  return tracer.init({
    version: currentCommitHash,
    profiling: true,
    service: "isucon12-qualifier"
  });
}