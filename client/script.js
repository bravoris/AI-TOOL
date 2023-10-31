
const form = document.querySelector('form');
const chatContainer = document.querySelector("#bot");
const undoBtn = document.getElementById('undo')
const botContainer = document.getElementById('bot')
const redoBtn = document.getElementById('redo')
const sendBtn = document.getElementById('send')
const textArea = document.getElementById('textarea')
const loaderDiv = document.getElementById('loader');
const wordsRange = document.getElementById("rangeValue")
const wordInput = document.getElementById("words")
const wordCount = document.getElementById('wordCount')
const backendApi = 'http://localhost:5000/'

let undoId = null;
let undoStack = [];
let noOfWords = 64;
let loadInterval;

wordsRange.value = noOfWords
wordInput.value = noOfWords

wordCount.innerHTML = 0

function loader(element){
  element.textContent = "Writing";

  loadInterval = setInterval(()=>{
    element.textContent += '.';

    if(element.textContent === "Writing...."){
      element.textContent = "Writing";
    }
  }, 200)
}

function typeText(element, text, uniqueId){
  element.innerHTML += " "+ `<div class="msg" id="${uniqueId}">${text}</div>`;
  wordCount.innerHTML = countWords(botContainer.textContent)
}

function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;

}

function countWords(s){
  s = s.replace(/(^\s*)|(\s*$)/gi,"");//exclude  start and end white-space
  s = s.replace(/[ ]{2,}/gi," ");//2 or more space to 1
  s = s.replace(/\n /,"\n"); // exclude newline with a start spacing
  return s.split(' ').filter(function(str){return str!="";}).length;
  //return s.split(' ').filter(String).length; - this can also be used
}

function disableButtons(){
  undoBtn.disabled = true;
  undoBtn.style.cursor = "not-allowed"
  redoBtn.disabled = true;
  redoBtn.style.cursor = "not-allowed"
  sendBtn.disabled = true;
  sendBtn.style.cursor = "not-allowed"
}

function enableButtons(){
  undoBtn.disabled = false;
  undoBtn.style.cursor = "pointer"
  redoBtn.disabled = false;
  redoBtn.style.cursor = "pointer"
  sendBtn.disabled = false;
  sendBtn.style.cursor = "pointer"
}

const handleSubmit = async (e) =>{
  disableButtons();
  e.preventDefault();
  const data = new FormData(form);
  noOfWords = data.get('words')
  form.reset();
  wordInput.value = noOfWords
  wordsRange.value = noOfWords
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById('bot');
  

  loader(loaderDiv)

  const response = await fetch(backendApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: messageDiv.textContent.replace('//n', "") +" "+ data.get('prompt'),
      words: data.get('words')
    })
  })

  //messageDiv.textContent +" "+

  if(response.ok) {
    undoStack.push(botContainer.innerHTML)
    console.log("InnerHTML: "+botContainer.innerHTML)
    const data = await response.json();
    const parsedData = data.bot.trim();
    let uniqueId = generateUniqueId();
    typeText(messageDiv, parsedData, uniqueId);

  }else{
    const err = await response.text();

    alert(err)
  }
  clearInterval(loadInterval);
  loaderDiv.innerHTML = "";
  enableButtons();
}

function handleUndo(){
  console.log("in Undo method")
  if(undoStack.length === 0){
    alert("Cannot Undo!!")
    return
  }
  botContainer.innerHTML = ""
  botContainer.innerHTML = undoStack.pop()
  wordCount.innerHTML = countWords(botContainer.textContent)
}

function handleRedo(e){

  handleUndo();
  handleSubmit(e);
}

const handleRewrite = async(selectedText)=>{
  disableButtons();
  loader(loaderDiv)
 
  const response = await fetch(backendApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: selectedText.toString() + "\n Rewrite the text above",
      words: wordInput.value.toString()
    })
  })

  clearInterval(loadInterval);
  loaderDiv.innerHTML = "";

  if(response.ok) {
    undoStack.push(botContainer.innerHTML)
    const data = await response.json();
    const parsedData = data.bot.trim();

    replaceText(parsedData, selectedText);
  }else{
    const err = await response.text();

    alert(err)
  }
  enableButtons();
}

function replaceText(newText, selectedText) {

  if(!selectedText.rangeCount){
    return
  }

  var range = selectedText.getRangeAt(0);

  range.deleteContents();

  var newNode = document.createTextNode(newText);

  range.insertNode(newNode);

  wordCount.innerHTML = countWords(botContainer.textContent)

  selectedText.collapseToEnd();
}

const handleExpand = async(selectedText)=>{
  disableButtons();
  loader(loaderDiv)
 
  const response = await fetch(backendApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: selectedText.toString() + "\n Expand the above paragraph to total " + wordInput.value + "words and complete all the sentences",
      words: wordInput.value.toString()
    })
  })

  clearInterval(loadInterval);
  loaderDiv.innerHTML = "";

  if(response.ok) {
    undoStack.push(botContainer.innerHTML)
    const data = await response.json();
    const parsedData = data.bot.trim();

    replaceText(parsedData, selectedText);
  }else{
    const err = await response.text();

    alert(err)
  }
  enableButtons();
}

const handleShorten = async(selectedText)=>{
  disableButtons();
  loader(loaderDiv)
 
  const response = await fetch(backendApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: selectedText.toString() + "\n Shorten the text above",
      words: wordInput.value.toString()
    })
  })

  clearInterval(loadInterval);
  loaderDiv.innerHTML = "";

  if(response.ok) {
    undoStack.push(botContainer.innerHTML)
    const data = await response.json();
    const parsedData = data.bot.trim();

    replaceText(parsedData, selectedText);
  }else{
    const err = await response.text();

    alert(err)
  }
  enableButtons();
}

const handleInstruct = async(selectedText)=>{
  disableButtons();
  loader(loaderDiv)
 
  const response = await fetch(backendApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: selectedText.toString() + ` in ${wordInput.value} words`,
      words: wordInput.value.toString()
    })
  })

  clearInterval(loadInterval);
  loaderDiv.innerHTML = "";

  if(response.ok) {
    undoStack.push(botContainer.innerHTML)
    const data = await response.json();
    const parsedData = data.bot.trim();

    replaceText(parsedData, selectedText);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }else{
    const err = await response.text();

    alert(err)
  }
  enableButtons();
}

const handleCtrlEnter = async(e)=>{
  disableButtons();
  loader(loaderDiv)

  var sel = window.getSelection();
  if(sel){

    sel.modify("extend", "backward", "documentboundary");

    const response = await fetch(backendApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: sel.toString().replace('\n', "") + "\n continue writing the above and add join sentences and paragraphs accordingly. Don't repeat the above and write new information",
      words: wordInput.value.toString()
    })
  })

  //messageDiv.textContent +" "+
  clearInterval(loadInterval);
  loaderDiv.innerHTML = "";

  if(response.ok) {
    undoStack.push(botContainer.innerHTML)
    const data = await response.json();
    const parsedData = data.bot.trim();
    replaceText(sel.toString() +" "+parsedData, sel);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  }
  
  enableButtons();
}


form.addEventListener('submit', handleSubmit);

form.addEventListener('keyup', (e)=>{
  if(e.keyCode === 13){
    handleSubmit(e);
  }
})

undoBtn.addEventListener('click', handleUndo);

redoBtn.addEventListener('click', (e)=>{
  handleRedo(e)
})

botContainer.addEventListener('keypress', (e)=>{
  if(e.keyCode === 10){
      handleCtrlEnter(e);
  }
})



botContainer.addEventListener('keydown', (e)=>{

  //Calling handleRewrite if ctrl + \ is pressed
  if(e.ctrlKey && e.keyCode === 220){
    var selectedText = window.getSelection();
    handleRewrite(selectedText);
  }
  //Calling handleShorten if ctrl + [ is pressed
  if(e.ctrlKey && e.keyCode === 219){
    var selectedText = window.getSelection();
    handleShorten(selectedText);
  }
  //Calling handleExpand if ctrl + ] is pressed
  if(e.ctrlKey && e.keyCode === 221){
    var selectedText = window.getSelection();
    handleExpand(selectedText);
  }
  //Calling handleInstruct if ctrl + ' is pressed
  if(e.ctrlKey && e.keyCode === 222){
    var selectedText = window.getSelection();
    handleInstruct(selectedText)
  }

})


wordsRange.addEventListener('change',()=>{
  console.log("on change range")
  wordInput.value = wordsRange.value
})

wordInput.addEventListener('change', ()=>{
  console.log("on change input")
  wordsRange.value = wordInput.value
})


botContainer.addEventListener("input", ()=>{
  wordCount.innerHTML = countWords(botContainer.textContent)
})



