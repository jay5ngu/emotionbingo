// Define arrays for words and definitions
const wordsEnteredArray = [
    "TRUST", "CONTEMPT", "EXCITEMENT", "CALMNESS", "DETERMINATION", "JEALOUSY/ENVY", "SHAME", "PITY", "ANGER", "SHYNESS",
    "DENIAL", "DISGUST", "FEAR", "GRATITUDE", "COMPASSION", "WORRY", "CONFUSION", "ACCEPTANCE", "HAPPINESS", "SURPRISE",
    "SHAMELESSNESS", "EMULATION", "APATHY", "ANTICIPATION", "INDIGNATION"
];

const definitions = [
    "Reliance on the character/ability/strength/truth of someone", 
    "Feeling that someone is beneath consideration", 
    "Great enthusiasm and eagerness", 
    "Being free from agitation or strong emotion", 
    "Firmness of purpose; resoluteness", 
    "Pain from others' good fortunes", 
    "Pain from regrettable acts; not confident", 
    "Pain caused by others' misfortunes", 
    "Fear/sadness", 
    "Nervous/reserved in front of others", 
    "Ignoring when something is wrong", 
    "Strong disapproval caused by something unpleasant or offensive", 
    "Often immediate anxiety or tension caused by pain", 
    "Appreciative of benefits received", 
    "Feeling caused by observing/hearing others suffering", 
    "Fear caused from preoccupied thoughts", 
    "Uncertainty and not understanding", 
    "Approval from self or others", 
    "Feeling well-adjusted or of good fortune", 
    "When something unexpected occurs", 
    "Lacking pain from regrettable acts", 
    "Mirroring another's traits", 
    "The opposite of love", 
    "Expectation", 
    "Anger or annoyance from unfair treatment"
];

let gameActive = true;
const correctAudio = document.getElementById("correct");
const wrongAudio = document.getElementById("wrong");

// Shuffle an array in place
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Create the bingo board
function createBoard() {
    // Reset all squares to default color
    for (let i = 0; i < 25; i++) {
        const square = document.getElementById(i);
        square.style.backgroundColor = "#4b7aa8";
        square.parentNode.style.backgroundColor = "#4b7aa8";
    }

    // Shuffle words and assign them to squares
    const order = Array.from({ length: 25 }, (_, i) => i);
    shuffle(order);

    const wordDefinitionPairs = order.map(index => ({
        word: wordsEnteredArray[index],
        definition: definitions[index]
    }));

    wordDefinitionPairs.forEach((pair, index) => {
        const square = document.getElementById(index);
        square.innerHTML = pair.word;
        square.dataset.definition = pair.definition;
    });

    // Set the matcher definition
    const randomDefinition = definitions[Math.floor(Math.random() * definitions.length)];
    const matcher = document.getElementById("matcher");
    matcher.innerHTML = randomDefinition;
    matcher.classList.add("fadeIn");

    // Show the bingo board
    document.getElementById("bingoBoard").hidden = false;
}

// Mark off a square
function markOff(spaceID) {
    if (!gameActive) return;

    const square = document.getElementById(spaceID);
    if (square.parentNode.style.backgroundColor === "white") return;

    const matcher = document.getElementById("matcher");
    if (square.dataset.definition === matcher.innerHTML) {
        handleCorrectMark(spaceID);
    } else {
        handleIncorrectMark(spaceID);
    }
}

function handleCorrectMark(spaceID) {
    const square = document.getElementById(spaceID);
    square.classList.add("correct");
    square.parentNode.style.backgroundColor = "white";
    square.style.backgroundColor = "white";

    // Play correct sound
    correctAudio.play();

    // Update matcher
    updateMatcher();

    // Check for bingo
    if (checkBingo()) {
        document.getElementById("bingo").innerHTML = "BINGO!";
    }
}

function handleIncorrectMark(spaceID) {
    const square = document.getElementById(spaceID);
    square.classList.add("incorrect");
    square.parentNode.style.backgroundColor = "red";
	square.style.backgroundColor = "transparent";

    setTimeout(() => {
        square.classList.remove("incorrect");
        square.parentNode.style.backgroundColor = "#4b7aa8";
    }, 750);

    // Play wrong sound
    wrongAudio.play();
}

function updateMatcher() {
    const matcher = document.getElementById("matcher");
    let newDefinition;
    let valid = false;

    while (!valid) {
        newDefinition = definitions[Math.floor(Math.random() * definitions.length)];
        valid = Array.from({ length: 25 }, (_, i) => document.getElementById(i))
            .some(square => square.dataset.definition === newDefinition && square.style.backgroundColor !== "white");
    }

    matcher.classList.remove("fadeIn");
    matcher.classList.add("fadeOut");
    setTimeout(() => {
        matcher.classList.remove("fadeOut");
        matcher.innerHTML = newDefinition;
        matcher.classList.add("fadeIn");
    }, 500);
}

// Check for bingo
function checkBingo() {
    const rows = Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => i * 5 + j));
    const cols = Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => j * 5 + i));
    const diags = [
        [0, 6, 12, 18, 24],
        [4, 8, 12, 16, 20]
    ];

    const allLines = [...rows, ...cols, ...diags];
    return allLines.some(line => line.every(index => document.getElementById(index).style.backgroundColor === "white"));
}
