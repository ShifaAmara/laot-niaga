/*=========================================
        NIAGA AI
=========================================*/

document.addEventListener("DOMContentLoaded",()=>{

    initAI();

});

const chatArea=document.getElementById("chatArea");
const chatInput=document.getElementById("chatInput");
const sendBtn=document.getElementById("sendBtn");

const quickButtons=document.querySelectorAll(".quick-btn");

function initAI(){

    if(!chatArea) return;

    sendBtn.addEventListener("click",sendMessage);

    chatInput.addEventListener("keypress",(e)=>{

        if(e.key==="Enter"){

            e.preventDefault();

            sendMessage();

        }

    });

    quickButtons.forEach(btn=>{

        btn.addEventListener("click",()=>{

            chatInput.value=btn.innerText;

            sendMessage();

        });

    });

}

/*=========================================
        SEND MESSAGE
=========================================*/

async function sendMessage(){

    const message=chatInput.value.trim();

    if(message==="") return;

    appendUser(message);

    chatInput.value="";

    const typing=showTyping();

    try{

        const reply = await askAI(message);

        typing.remove();

        appendAI(reply);

    }

    catch{

        typing.remove();

        appendAI("Maaf, terjadi kesalahan.");

    }

}

/*=========================================
        USER
=========================================*/

function appendUser(text){

    chatArea.innerHTML+=`

    <div class="user-message">

        <div class="bubble-user">

            ${text}

        </div>

    </div>

    `;

    scrollBottom();

}

/*=========================================
        AI
=========================================*/

function appendAI(text){

    chatArea.innerHTML+=`

    <div class="ai-message">

        <div class="ai-avatar">

            <img src="assets/img/niaga-ai-icon.png">

        </div>

        <div class="bubble-ai">

            ${text}

        </div>

    </div>

    `;

    scrollBottom();

}

/*=========================================
        TYPING
=========================================*/

function showTyping(){

    const div=document.createElement("div");

    div.className="ai-message";

    div.innerHTML=`

    <div class="ai-avatar">

        <img src="assets/img/niaga-ai-icon.png">

    </div>

    <div class="bubble-ai">

        <span class="typing">

            NIAGA AI sedang mengetik...

        </span>

    </div>

    `;

    chatArea.appendChild(div);

    scrollBottom();

    return div;

}

/*=========================================
        SCROLL
=========================================*/

function scrollBottom(){

    chatArea.scrollTop=chatArea.scrollHeight;

}

/*=========================================
        DEMO AI
=========================================*/

async function askAI(prompt){

    const response = await fetch(

        "http://localhost:5000/api/ai",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                prompt

            })

        }

    );

    const data = await response.json();

    return data.reply;

}