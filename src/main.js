import Pusher from 'pusher-js';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
const MY_CHANNEL = 'my-channel';
const MY_EVENT = 'my-event';
const VOICE_LANGUAGE = 'pl-PL';
const VOICE_SPEED = 1.1;


const pusher = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER
});

// Tworzenie obiektu Syntezy mowy i odtworzenie tekstu z argumentu
const synth = window.speechSynthesis;
let activeUtterance = null;
function speakText(text) {
    if (!synth) {
        console.error("Speech synthesis is not supported in this browser.");
        return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = VOICE_LANGUAGE;
    utterance.rate = VOICE_SPEED;

    utterance.onerror = (e) => {
        console.error("Speech synthesis error: " + e.error);
        activeUtterance = null;
    };
    utterance.onend = () => {
        activeUtterance = null;
    };
    activeUtterance = utterance;
    if (synth !== undefined && utterance !== undefined) {
        synth.speak(utterance);
    }
}

const channel = pusher.subscribe(MY_CHANNEL);

channel.bind(MY_EVENT, function(data) {
    console.log("Alert odebrany:", data);

    // Wypełnij dane
    const msg = data.message;
    const box = document.getElementById('alert-box');
    const userNameElem = document.getElementById('user-name');
    const amountElem = document.getElementById('donation-amount');
    const messageElem = document.getElementById('donation-message');

    if (box && userNameElem && amountElem && messageElem) {
        userNameElem.innerText = data.user + " wpłacił:";
        amountElem.innerText = data.amount;
        messageElem.innerText = data.message;

        // Pokaż alert
        box.style.display = 'block';

        // Text-to-Speech (Syntezator mowy)
        speakText(msg);

        // Ukryj po 5 sekundach
        setTimeout(() => {
            box.style.display = 'none';
        }, 5000);
    } else {
        console.error("Błąd: Nie znaleziono elementów alertu w DOM.");
    }
});

document.addEventListener('DOMContentLoaded', () => {
});