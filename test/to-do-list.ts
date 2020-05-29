import {
  Client,
  Provider,
  ProviderRegistry,
  Result,
} from "@blockstack/clarity";
import { assert } from "chai";
const address = [
  "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  "STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6",
  "ST11NJTTKGVT6D1HY4NJRVQWMQM7TVAR091EJ8P2Y",
  "ST1HB1T8WRNBYB0Y3T7WXZS38NKKPTBR3EG9EPJKR",
  "STRYYQQ9M8KAF4NS7WNZQYY59X93XEKR31JP64CP",
];
const deployer = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";
const user = "STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6";
const task1ID = 1;
const task1Name = '"Task 1"';
const task2ID = 2;
const task2Name = '"Task 2"';
const task3ID = 3;
const task3Name = '"Task 3"';
const completed = 1;
const inProgress = 0;

describe("todo list contract test suite", () => {
  let toDoListClient: Client;
  let provider: Provider;

  const getNumberOfTasks = async () => {
    const query = toDoListClient.createQuery({
      method: { name: "getNumberOfTasks", args: [] },
    });
    const receipt = await toDoListClient.submitQuery(query);
    const result = Result.unwrapInt(receipt);
    return result;
  };
  const getTaskName = async (id: number) => {
    const query = toDoListClient.createQuery({
      method: { name: "getTaskName", args: [`${id}`] },
    });
    const receipt = await toDoListClient.submitQuery(query);
    const result = Result.unwrapString(receipt);
    return result;
  };
  const getTaskCompleteStatus = async (id: number) => {
    const query = toDoListClient.createQuery({
      method: { name: "getTaskCompleteStatus", args: [`${id}`] },
    });
    const receipt = await toDoListClient.submitQuery(query);
    const result = Result.unwrapInt(receipt);
    return result;
  };

  const toggleTaskStatus = async (signer: string, id: number) => {
    const tx = toDoListClient.createTransaction({
      method: { name: "toggleTaskStatus", args: [`${id}`] },
    });
    await tx.sign(signer);
    const receipt = await toDoListClient.submitTransaction(tx);
    return receipt;
  };

  const addTask = async (signer: string, taskName: string) => {
    const tx = toDoListClient.createTransaction({
      method: { name: "addTask", args: [`${taskName}`] },
    });
    await tx.sign(signer);
    const receipt = await toDoListClient.submitTransaction(tx);

    return receipt;
  };
  before(async () => {
    provider = await ProviderRegistry.createProvider();
    toDoListClient = new Client(
      `${deployer}.to-do-list`,
      "to-do-list",
      provider
    );
  });
  it("should have a valid syntax", async () => {
    await toDoListClient.checkContract();
  });
  describe("deploying an instance of the contract", () => {
    let deploymentReceipt;

    before(async () => {
      deploymentReceipt = await toDoListClient.deployContract();
    });
    it("should deployed succeffully", async () => {
      assert.isTrue(deploymentReceipt.success);
    });
    it("should number of task is zero by default", async () => {
      let numberOfTasks = await getNumberOfTasks();

      assert.equal(numberOfTasks, 0);
    });
  });
  describe("Tasks operations", () => {
    it("should add new Task ", async () => {
      let numberOfTasks: number;
      await addTask(deployer, `${task1Name}`);
      numberOfTasks = await getNumberOfTasks();
      const task = await getTaskName(task1ID);
      const statues = await getTaskCompleteStatus(task1ID);
      assert.equal(numberOfTasks, 1);
      assert.equal(task, "Task 1");
      assert.equal(statues, inProgress);
    });
    it("should toggle Task complete status", async () => {
      let statues = await getTaskCompleteStatus(task1ID);
      assert.equal(statues, inProgress);
      await toggleTaskStatus(user, task1ID);
      statues = await getTaskCompleteStatus(task1ID);
      assert.equal(statues, completed);
    });

    it("should get correct number of Tasks ", async () => {
      let numberOfTasks: number;
      await addTask(deployer, `${task2Name}`);
      await addTask(deployer, `${task3Name}`);
      numberOfTasks = await getNumberOfTasks();

      assert.equal(numberOfTasks, 3);
    });
    it("should get correct task name ", async () => {
      const task = await getTaskName(task3ID);

      assert.equal(task, "Task 3");
    });
    it("should get correct task ncompleted status ", async () => {
      await toggleTaskStatus(user, task1ID);
      let statues = await getTaskCompleteStatus(task1ID);
      assert.equal(statues, inProgress);
    });
  });

  after(async () => {
    await provider.close();
  });
});
