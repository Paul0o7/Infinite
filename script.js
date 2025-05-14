class InteractiveNarrative {
    constructor(narrativeData, playerDivId, promptContainerId, promptTextId, decisionContainerId, restartButtonId) {
        this.narrative = narrativeData;
        this.playerDivId = playerDivId;
        this.promptContainer = document.getElementById(promptContainerId);
        this.promptTextElement = document.getElementById(promptTextId);
        this.decisionContainer = document.getElementById(decisionContainerId);
        this.restartButton = document.getElementById(restartButtonId);
        this.player = null;
        this.currentVideoId = Object.keys(this.narrative)[0]; // Start with the first video

        // ADD THIS:  Attach the event listener here!
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => this.restart());
        }
    }

    init() {
        this.loadYouTubeIframeAPI();
    }

    loadYouTubeIframeAPI() {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = () => this.onYouTubeIframeAPIReady();
    }

    onYouTubeIframeAPIReady() {
        this.player = new YT.Player(this.playerDivId, {
            height: '360',
            width: '640',
            videoId: this.currentVideoId,
            playerVars: {
                'autoplay': 1,
                'controls': 1,
                'mute': 1
            },
            events: {
                'onReady': (event) => this.onPlayerReady(event),
                'onStateChange': (event) => this.onPlayerStateChange(event)
            }
        });
    }

    onPlayerReady(event) {
        console.log("Player is ready. Initial video:", this.currentVideoId);
    }

    playNext(videoId) {
        this.currentVideoId = videoId;
        this.player.loadVideoById(videoId);
        this.promptContainer.style.display = 'none';
        this.decisionContainer.innerHTML = '';
        if (this.restartButton) this.restartButton.style.display = 'none';
        console.log("Playing:", videoId);
    }

    showChoices(choicesObject, promptText) {
        this.promptContainer.style.display = 'block';
        this.promptTextElement.textContent = promptText;
        this.decisionContainer.innerHTML = '';
        for (const choiceText in choicesObject) {
            const nextVideoId = choicesObject[choiceText];
            const button = document.createElement('button');
            button.classList.add('choice-button');
            button.textContent = choiceText;
            button.addEventListener('click', () => this.playNext(nextVideoId));
            this.decisionContainer.appendChild(button);
        }
        console.log("Showing choices for:", this.currentVideoId);
    }

    handleVideoEnd() {
        const data = this.narrative[this.currentVideoId];
        console.log("Ended:", this.currentVideoId, data);
        if (data) {
            if (data.type === 'choice_intro') {
                console.log("Handling choice intro:", this.currentVideoId);
                this.showChoices(data.choices, data.prompt);
            } else if (data.next) {
                this.playNext(data.next);
            } else if (data.type === 'end') {
                if (this.restartButton) this.restartButton.style.display = 'block';
                console.log("Show restart.");
            }
        }
    }

    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            const videoId = this.player.getVideoData().video_id;
            const data = this.narrative[videoId];
            console.log("Video Ended Event:", videoId, data);
            this.handleVideoEnd();
        } else if (event.data === YT.PlayerState.PLAYING) {
            console.log("Video Playing:", this.player.getVideoData().video_id);
        }
    }

    restart() {
        this.playNext(Object.keys(this.narrative)[0]);
    }
}

const narrativeData = {
    "EaB606bZ1pc": { type: 'content', next: "jaEfA2Pa7pk_A" },
    "jaEfA2Pa7pk_A": {
        type: 'choice_intro',
        prompt: "Robert it is your turn to choose:",
        choices: {
            "Choice A": "tiMOgfZnLTY",
            "Choice B": "7GU4ZUUbefc"
        }
    },
    "tiMOgfZnLTY": { type: 'content', next: "jaEfA2Pa7pk_C" },
    "jaEfA2Pa7pk_C": {
        type: 'choice_intro',
        prompt: "Robert it is your turn to choose:",
        choices: {
            "Choice C": "XHpmn2imQ48",
            "Choice D": "3JpqUWX84pc"
        }
    },
    "XHpmn2imQ48": { type: 'content', next: "WD2mvN_LIfQ" },
    "WD2mvN_LIfQ": { type: 'end' },
    "7GU4ZUUbefc": { type: 'content', next: "jaEfA2Pa7pk_E" },
    "jaEfA2Pa7pk_E": {
        type: 'choice_intro',
        prompt: "Robert it is your turn to choose:",
        choices: {
            "Choice E": "4IoGDWM2RV0",
            "Choice F": "objvlXdSi28"
        }
    },
    "objvlXdSi28": { type: 'content', next: "YU8ApFsz9BM" },
    "YU8ApFsz9BM": { type: 'end' },
    "3JpqUWX84pc": { type: 'content', next: null },
    "4IoGDWM2RV0": { type: 'content', next: null }
};

const interactiveStory = new InteractiveNarrative(
    narrativeData,
    'player',
    'prompt-container',
    'prompt-text',
    'decision-container',
    'restartButton'
);

interactiveStory.init();

// REMOVE this entire block of code:
// const topRightRestartButton = document.getElementById('topRightRestartButton');
// if (topRightRestartButton) {
//     topRightRestartButton.addEventListener('click', () => interactiveStory.restart());
// }
