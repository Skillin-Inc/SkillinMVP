import { useEffect } from "react";

function test1() {
  return "3";
}

const test2 = () => {};

useEffect(() => {
  console.log("hi");
});
test1();
