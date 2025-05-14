const narrative = {
    // Start
    "FAyKDaXEAgc": { next: "BB49x_uMlGA" },

    // First choice
    "BB49x_uMlGA": {
        decisionPoint: true,
        prompt: "What will you do first?",
        choices: {
            "Explore the Woods": "w5QfOa1HNHc",
            "Check the House": "6mvbxaXNxjQ"
        }
    },

    // Path 1: Woods
    "w5QfOa1HNHc": { next: "FAyKDaXEAgc_WOODS_NEXT" },
    "FAyKDaXEAgc_WOODS_NEXT": {
        decisionPoint: true,
        prompt: "The path splits. Which way?",
        choices: {
            "Go Left": "w5QfOa1HNHc_LEFT",
            "Go Right": "6mvbxaXNxjQ_RIGHT"
        }
    },
    "w5QfOa1HNHc_LEFT": { next: "w5QfOa1HNHc_SEMI_END" },
    "w5QfOa1HNHc_SEMI_END": { next: "w5QfOa1HNHc_END" },
    "w5QfOa1HNHc_END": { /* Restart */ },
    "6mvbxaXNxjQ_RIGHT": { next: "6mvbxaXNxjQ_CONTENT" },
    "6mvbxaXNxjQ_CONTENT": { next: "6mvbxaXNxjQ_END" },
    "6mvbxaXNxjQ_END": { /* Restart */ },

    // Path 2: House
    "6mvbxaXNxjQ": { next: "BB49x_uMlGA_HOUSE_CHOICE" },
    "BB49x_uMlGA_HOUSE_CHOICE": {
        decisionPoint: true,
        prompt: "What do you investigate?",
        choices: {
            "The Attic": "FAyKDaXEAgc_ATTIC",
            "The Basement": "BB49x_uMlGA_BASEMENT"
        }
    },
    "FAyKDaXEAgc_ATTIC": { next: "FAyKDaXEAgc_SEMI_END_ATTIC" },
    "FAyKDaXEAgc_SEMI_END_ATTIC": { next: "FAyKDaXEAgc_END_ATTIC" },
    "FAyKDaXEAgc_END_ATTIC": { /* Restart */ },
    "BB49x_uMlGA_BASEMENT": { next: "BB49x_uMlGA_END_BASEMENT" },
    "BB49x_uMlGA_END_BASEMENT": { /* Restart */ }
};

let player;
let currentVideoId;
const playerDivId = 'player';
const promptContainer = document.getElementById('prompt-container');
const promptTextElement = document.getElementById('prompt-text');
const decisionContainer = document.getElementById('decision-container');
const playButton = document.getElementById('playButton');
let playButtonClicked = false; // Flag to track if the button was clicked

function onYouTubeIframeAPIReady() {
    console.log("YouTube API is ready!");
    player = new YT.Player(playerDivId, {
        height: '360',
        width: '640',
        videoId: getFirstVideoId(),
        playerVars: {
            'autoplay': 0, // No initial autoplay
            'controls': 1, // Enable the player controls
            'mute': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log("Player is ready.");
    const firstVideoId = getFirstVideoId();
    loadAndPlayVideo(firstVideoId); // Load the first video here
    currentVideoId = firstVideoId; // Set currentVideoId here
    console.log("Initial video loaded:", currentVideoId);
    if (playButton) {
        playButton.style.display = 'none'; // Hide the button initially
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        console.log("Video ended:", currentVideoId);
        const currentVideoData = narrative[currentVideoId];
        console.log("Narrative data for ended video:", currentVideoData);
        if (currentVideoData && currentVideoData.decisionPoint) {
            console.log("Showing decision for:", currentVideoId);
            promptContainer.style.display = 'block';
            promptTextElement.textContent = currentVideoData.prompt;
            decisionContainer.innerHTML = '';
            for (const choiceText in currentVideoData.choices) {
                const nextVideoId = currentVideoData.choices[choiceText];
                const button = document.createElement('button');
                button.classList.add('choice-button');
                button.textContent = choiceText;
                button.addEventListener('click', () => {
                    console.log("Choice made:", choiceText, "leads to", nextVideoId);
                    loadAndPlayVideo(nextVideoId);
                });
                decisionContainer.appendChild(button);
            }
        } else if (currentVideoData && currentVideoData.next) {
            const nextVideoId = currentVideoData.next;
            console.log("Moving to next video:", nextVideoId, "after", currentVideoId);
            setTimeout(() => {
                loadAndPlayVideo(nextVideoId);
            }, 3000);
        } else {
            // Ending video
            console.log("End reached:", currentVideoId, "- Showing restart button.");
            const restartButton = document.createElement('button');
            restartButton.textContent = "Restart";
            restartButton.style.padding = '12px 25px';
            restartButton.style.fontSize = '1em';
            restartButton.style.cursor = 'pointer';
            restartButton.style.marginTop = '20px';
            restartButton.addEventListener('click', () => {
                window.location.reload(); // Reload the page to restart
            });
            document.getElementById('video-container').appendChild(restartButton);
            if (playButton) playButton.style.display = 'none'; // Hide any lingering play buttons
        }
    } else if (event.data === YT.PlayerState.PLAYING) {
        console.log("Video playing:", currentVideoId);
    }
}

function loadYouTubeIframeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api"; // Use HTTPS
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function getFirstVideoId() {
    const firstKey = Object.keys(narrative)[0];
    console.log("First video ID:", firstKey);
    return firstKey;
}

function loadAndPlayVideo(videoId) {
    if (player && player.loadVideoById) {
        console.log("Loading video:", videoId);
        player.loadVideoById(videoId);
        currentVideoId = videoId;
        promptContainer.style.display = 'none';
        decisionContainer.innerHTML = '';
        // We don't want to hide the play button here anymore, as the initial play is automatic
    } else {
        console.error("Player not yet initialized.");
    }
}

function handleVideoEnd(videoId) {
    // The logic for handling video end is now within the onPlayerStateChange function.
}

loadYouTubeIframeAPI();