export function chooseModel(task="general"){
  const t=task.toLowerCase();
  if(/security|vulnerab|secret/.test(t)) return process.env.SECURITY_MODEL||process.env.OPENAI_MODEL||"gpt-5.6-luna";
  if(/code|refactor|bug|test|github|repository/.test(t)) return process.env.CODING_MODEL||process.env.OPENAI_MODEL||"gpt-5.6-luna";
  if(/plan|architect|design|research/.test(t)) return process.env.REASONING_MODEL||process.env.OPENAI_MODEL||"gpt-5.6-luna";
  return process.env.GENERAL_MODEL||process.env.OPENAI_MODEL||"gpt-5.6-luna";
}
export function modelConfig(task){
  return {model:chooseModel(task),provider:process.env.AI_PROVIDER||"openai"};
}
