let memory = [];
let totalMemorySize = 100;
let firstFitStats = { attempts: 0, successful: 0 };
let bestFitStats = { attempts: 0, successful: 0 };

function initMemory() {
  totalMemorySize = parseInt(document.getElementById("memSize").value, 10);
  memory = [{
    start: 0,
    size: totalMemorySize,
    allocated: false
  }];
  renderMemory();
  resetStats();
}

function resetStats() {
  firstFitStats = { attempts: 0, successful: 0 };
  bestFitStats = { attempts: 0, successful: 0 };
  updateResults();
}

function renderMemory() {
  const container = document.getElementById("memory-container");
  container.innerHTML = "";
  memory.forEach((block, index) => {
    const div = document.createElement("div");
    div.className = "memory-block " + (block.allocated ? "allocated" : "free");
    div.textContent = "Block " + index + ": " + (block.allocated ? "Allocated" : "Free") + " | Size: " + block.size + " | Start: " + block.start;
    container.appendChild(div);
  });
}

function allocateMemory() {
  const size = parseInt(document.getElementById("allocSize").value, 10);
  const algo = document.getElementById("algo").value;
  let chosenIndex = -1;
  let chosenBlock = null;

  if (algo === "first-fit") {
    firstFitStats.attempts++;
    for (let i = 0; i < memory.length; i++) {
      if (!memory[i].allocated && memory[i].size >= size) {
        chosenIndex = i;
        chosenBlock = memory[i];
        break;
      }
    }
  } else if (algo === "best-fit") {
    bestFitStats.attempts++;
    let bestIndex = -1;
    let bestSize = Infinity;
    for (let i = 0; i < memory.length; i++) {
      if (!memory[i].allocated && memory[i].size >= size && memory[i].size < bestSize) {
        bestSize = memory[i].size;
        bestIndex = i;
      }
    }
    if (bestIndex !== -1) {
      chosenIndex = bestIndex;
      chosenBlock = memory[bestIndex];
    }
  }

  if (chosenBlock === null) {
    alert("Not enough memory available to allocate " + size + " units.");
    return;
  }

  const allocatedBlock = {
    start: chosenBlock.start,
    size: size,
    allocated: true
  };

  const remainingSize = chosenBlock.size - size;
  if (remainingSize > 0) {
    const freeBlock = {
      start: chosenBlock.start + size,
      size: remainingSize,
      allocated: false
    };
    memory.splice(chosenIndex, 1, allocatedBlock, freeBlock);
  } else {
    memory.splice(chosenIndex, 1, allocatedBlock);
  }

  if (algo === "first-fit") {
    firstFitStats.successful++;
  } else {
    bestFitStats.successful++;
  }

  renderMemory();
  updateResults();
}

function deallocateMemory() {
  const index = parseInt(document.getElementById("deallocIndex").value, 10);
  if (index < 0 || index >= memory.length || memory[index].allocated === false) {
    alert("Invalid index or block is already free.");
    return;
  }
  
  // Mark the block as free
  memory[index].allocated = false;
  
  // Merge adjacent free blocks
  mergeFreeBlocks();
  
  // Re-render the memory blocks
  renderMemory();
  updateResults();
}

function mergeFreeBlocks() {
  for (let i = 0; i < memory.length - 1; i++) {
    if (!memory[i].allocated && !memory[i + 1].allocated) {
      memory[i].size += memory[i + 1].size;
      memory.splice(i + 1, 1);
      i--;
    }
  }
}

function updateResults() {
  const resultsDiv = document.getElementById("results");
  const totalAllocated = memory.reduce((acc, block) => acc + (block.allocated ? block.size : 0), 0);
  const utilization = ((totalAllocated / totalMemorySize) * 100).toFixed(2);
  
  resultsDiv.innerHTML = `
    <h3>Results</h3>
    <p><strong>First Fit:</strong> Attempts: ${firstFitStats.attempts}, Successful: ${firstFitStats.successful}</p>
    <p><strong>Best Fit:</strong> Attempts: ${bestFitStats.attempts}, Successful: ${bestFitStats.successful}</p>
    <p><strong>Memory Utilization:</strong> ${utilization}%</p>
  `;
}

window.onload = initMemory;