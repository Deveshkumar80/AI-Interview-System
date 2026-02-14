from flask import Flask, render_template, jsonify, request
import requests

app = Flask(__name__)

# 🔹 GLOBAL VARIABLES
question_number = 0
total_questions = 10

questions = []   # store all questions
answers = []     # store all answers
scores = []      # store scores


# 🔹 CALL OLLAMA
def ask_llama(prompt):
    try:
        res = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
        )
        return res.json()["response"]
    except:
        return "2"   # fallback score


# 🔹 HOME
@app.route("/")
def home():
    return render_template("index.html")


# 🔹 GET QUESTION
@app.route("/get_question")
def get_question():
    global question_number

    if question_number >= total_questions:
        return jsonify({"done": True})

    question_number += 1

    # mix HR + DSA
    if question_number % 2 == 0:
        prompt = "Ask one medium DSA interview question only (no answer)"
    else:
        prompt = "Ask one HR interview question only (no answer)"

    question = ask_llama(prompt)

    questions.append(question)

    return jsonify({
        "question": question,
        "number": question_number,
        "total": total_questions,
        "done": False
    })


# 🔹 SUBMIT ANSWER + SCORE STORE
@app.route("/submit_answer", methods=["POST"])
def submit_answer():
    data = request.json

    question = data["question"]
    answer = data["answer"]

    answers.append(answer)

    # 🔥 SCORING LOGIC
    prompt = f"""
    Evaluate this answer.

    Question: {question}
    Answer: {answer}

    Give score out of 5.
    Return ONLY number.
    """

    result = ask_llama(prompt)

    # 🔥 SAFE SCORE EXTRACTION
    try:
        score = int(''.join(filter(str.isdigit, result)))
        if score > 5:
            score = 5
    except:
        score = 2  # fallback

    scores.append(score)

    return jsonify({"status": "saved"})


# 🔹 FINAL RESULT
@app.route("/get_score")
def get_score():

    total_score = sum(scores)

    details = []
    for i in range(len(scores)):
        details.append({
            "question": questions[i],
            "answer": answers[i],
            "score": scores[i]
        })

    return jsonify({
        "total_score": total_score,
        "max_score": total_questions * 5,
        "details": details
    })


if __name__ == "__main__":
    app.run(debug=True)
