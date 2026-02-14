let current = 0;
let total = 10;

let recognition;
let isListening = false;


// 👉 NEXT QUESTION
function nextQuestion() {

    fetch("/get_question")
    .then(res => res.json())
    .then(data => {

        if (data.done) {
            getScore();
            return;
        }

        current = data.number;

        document.getElementById("question").innerText = data.question;
        document.getElementById("progressText").innerText =
            "Question " + current + "/" + total;

        document.getElementById("answer").value = "";

        let percent = (current / total) * 100;
        document.getElementById("progressBar").style.width = percent + "%";
    });
}


// 👉 SUBMIT ANSWER
function submitAnswer() {

    let ans = document.getElementById("answer").value;
    let ques = document.getElementById("question").innerText;

    if (!ans) {
        alert("Write or speak something!");
        return;
    }

    fetch("/submit_answer", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            question: ques,
            answer: ans
        })
    })
    .then(() => alert("Answer Saved ✅"));
}


// 👉 FINAL SCORE
function getScore() {

    fetch("/get_score")
    .then(res => res.json())
    .then(data => {

        let output = "🔥 FINAL SCORE: " + data.total_score + "/50\n\n";

        data.details.forEach((item, i) => {
            output += `Q${i+1}: ${item.score}/5\n`;
        });

        document.getElementById("result").innerText = output;
    });
}


// 🎤 MIC (WORKING FIX)
function startMic() {

    if (!('webkitSpeechRecognition' in window)) {
        alert("Use Google Chrome for voice input");
        return;
    }

    if (!recognition) {

        recognition = new webkitSpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = function(event) {

            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            document.getElementById("answer").value = transcript;
        };

        recognition.onerror = function(event) {
            console.log("Mic error:", event.error);
        };

        recognition.onend = function() {
            if (isListening) {
                recognition.start(); // restart
            }
        };
    }

    if (!isListening) {
        recognition.start();
        isListening = true;
        alert("🎤 Mic Started");
    } else {
        recognition.stop();
        isListening = false;
        alert("🛑 Mic Stopped");
    }
}
