// Import the scheduler.
import { IntervalBasedCronScheduler } from "cron-schedule/schedulers/interval-based";
import { parseCronExpression } from "cron-schedule";

function main() {
  const scheduler = new IntervalBasedCronScheduler(10);

  const cron = parseCronExpression("*/1 * * * *");
  const taskId: number = scheduler.registerTask(cron, () => console.log("Eseguendo task ogni minuto"));
  console.log("Task registrato con id: ", taskId);
}

main();

// TODO gracefully shutdown the scheduler
