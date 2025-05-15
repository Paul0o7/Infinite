class InteractiveNarrative {
    constructor(narrativeData, playerDivId, promptContainerId, promptTextId, decisionContainerId, restartButtonId, goBackButtonId, startScreenId) {
        this.narrative = narrativeData;
        this.playerDivId = playerDivId;
        this.promptContainer = document.getElementById(promptContainerId);
        this.promptTextElement = document.getElementById(promptTextId);
        this.decisionContainer = document.getElementById(decisionContainerId);
        this.restartButton = document.getElementById(restartButtonId);
        this.goBackButton = document.getElementById(goBackButtonId);
        this.startScreen = document.getElementById(startScreenId);
        this.player = null;
        this.currentVideoId = Object.keys(this.narrative)[0];
        this.lastChoiceVideoId = null;
        this.history = [];

        if (this.restartButton) this.restartButton.addEventListener('click', () => this.restart());
        if (this.goBackButton) this.goBackButton.addEventListener('click', () => this.goBack());
    }

    init() {
        const playButton = document.getElementById('playButton');
        const videoContainer = document.getElementById('video-container');

        videoContainer.style.display = 'none';
        this.promptContainer.style.display = 'none';

        playButton.addEventListener('click', () => {
            this.startScreen.style.display = 'none';
            videoContainer.style.display = 'block';
            this.loadYouTubeIframeAPI();
        });
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
                'mute': 0,
                'playsinline': 1,
                'rel': 0
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
        this.history.push(this.currentVideoId);
        const nextData = this.narrative[videoId];
        if (nextData && nextData.type !== 'choice_trigger') {
            this.currentVideoId = videoId;
            this.player.loadVideoById(videoId);
            this.promptContainer.style.display = 'none';
            this.decisionContainer.innerHTML = '';
            if (this.restartButton) this.restartButton.style.display = 'none';
            if (this.goBackButton) this.goBackButton.style.display = 'none';
            console.log("Playing:", videoId);
        } else if (nextData && nextData.type === 'choice_trigger') {
            this.currentVideoId = nextData.videoId;
            this.player.loadVideoById(nextData.videoId);
            this.showChoices(nextData.choices, nextData.prompt);
            console.log("Playing choice video:", nextData.videoId, "with choices.");
        } else if (nextData && nextData.type === 'end') {
            this.currentVideoId = videoId;
            this.player.loadVideoById(videoId);
            this.promptContainer.style.display = 'none';
            this.decisionContainer.innerHTML = '';
            if (this.restartButton) this.restartButton.style.display = 'block';
            if (this.history.length > 0 && this.goBackButton) this.goBackButton.style.display = 'block';
            console.log("End video:", videoId, " - Showing restart.");
        }
    }

    showChoices(choicesObject, promptText) {
        this.promptContainer.style.display = 'block';
        this.promptTextElement.textContent = promptText;
        this.decisionContainer.innerHTML = '';

        const choicesArray = Object.entries(choicesObject);
        for (let i = choicesArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choicesArray[i], choicesArray[j]] = [choicesArray[j], choicesArray[i]];
        }

        choicesArray.forEach(([choiceText, nextVideoId]) => {
            const button = document.createElement('button');
            button.classList.add('choice-button');
            button.textContent = choiceText;
            button.addEventListener('click', () => {
                const currentVideoData = this.narrative[this.currentVideoId];
                if (currentVideoData && currentVideoData.type === 'choice_trigger') {
                    this.lastChoiceVideoId = this.currentVideoId;
                } else {
                    this.lastChoiceVideoId = this.history[this.history.length - 1] || Object.keys(this.narrative)[0];
                }
                this.playNext(nextVideoId);
            });
            this.decisionContainer.appendChild(button);
        });

        console.log("Showing randomized choices for:", this.currentVideoId);
    }

    handleVideoEnd() {
        const videoId = this.player.getVideoData().video_id;
        const data = this.narrative[
            Object.keys(this.narrative).find(key => this.narrative[key].videoId === videoId || key === videoId)
        ];
        console.log("Video Ended Event:", videoId, data);
        if (data && data.next) {
            this.playNext(data.next);
        } else if (data && data.type === 'choice_trigger') {
            // Choices are already handled in playNext
        } else if (data && data.type === 'end') {
            if (this.restartButton) this.restartButton.style.display = 'block';
            if (this.history.length > 0 && this.goBackButton) this.goBackButton.style.display = 'block';
            console.log("Video ended (end type):", videoId, "- Showing buttons.");
        } else {
            const nextEntryKey = Object.keys(this.narrative).find(key => this.narrative[key] === data);
            if (nextEntryKey && this.narrative[data.next] && this.narrative[data.next].type === 'choice_trigger') {
                this.playNext(data.next);
            } else if (data && data.type === 'content' && !data.next) {
                if (this.restartButton) this.restartButton.style.display = 'block';
                if (this.history.length > 0 && this.goBackButton) this.goBackButton.style.display = 'block';
                console.log("Content video ended with no explicit next, showing buttons.");
            }
        }
    }

    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            this.handleVideoEnd();
        } else if (event.data === YT.PlayerState.PLAYING) {
            console.log("Video Playing:", this.player.getVideoData().video_id);
        }
    }

    restart() {
        this.history = [];
        this.lastChoiceVideoId = null;
        this.playNext(Object.keys(this.narrative)[0]);
    }

    goBack() {
        if (this.history.length > 1) {
            this.history.pop();
            const previousVideoId = this.history.pop();
            this.playNext(previousVideoId);
        } else if (this.history.length === 1) {
            this.playNext(this.history[0]);
            this.history = [];
        }
        if (this.history.length === 0) {
            if (this.goBackButton) this.goBackButton.style.display = 'none';
        }
    }
}

const narrativeData = {
    "6BVODi60Iwo": { type: 'content', next: "IE32WVhJWDk_CHOICE_1" },

    "IE32WVhJWDk_CHOICE_1": {
        type: 'choice_trigger',
        videoId: "IE32WVhJWDk",
        prompt: "Robert it is your turn to choose (first time):",
        choices: {
            "Save the future": "1XD6sydTSpg",
            "Ignore the message": "xecgqAqFWSc"
        }
    },
    "1XD6sydTSpg": { type: 'content', next: "IE32WVhJWDk_CHOICE_2" },
    "xecgqAqFWSc": { type: 'end' },

    "IE32WVhJWDk_CHOICE_2": {
        type: 'choice_trigger',
        videoId: "IE32WVhJWDk",
        prompt: "Robert it is your turn to choose (second time):",
        choices: {
            "Sulk?": "NgNm6ZE96rk",
            "Beat Paul?": "yMtGyQ5DZ2A"
        }
    },
    "NgNm6ZE96rk": { type: 'content', next: "IE32WVhJWDk_CHOICE_3" },
    "yMtGyQ5DZ2A": { type: 'end' },

    "IE32WVhJWDk_CHOICE_3": {
        type: 'choice_trigger',
        videoId: "IE32WVhJWDk",
        prompt: "Robert it is your turn to choose (third time):",
        choices: {
            "Timeline B?": "GMtMByfuu9Q",
            "Timeline A?": "0kDmYIe5t3Q"
        }
    },
    "0kDmYIe5t3Q": { type: 'end' },
    "GMtMByfuu9Q": { type: 'content', next: "IE32WVhJWDk_CHOICE_4" },

    "IE32WVhJWDk_CHOICE_4": {
        type: 'choice_trigger',
        videoId: "IE32WVhJWDk",
        prompt: "Robert it is your turn to choose (fourth time):",
        choices: {
            "Put on desk?": "lYQrd12eK98",
            "Greet Self": "yw7qUqrIni0"
        }
    },
    "lYQrd12eK98": { type: 'end' },
    "yw7qUqrIni0": { type: 'end' }
};

const interactiveStory = new InteractiveNarrative(
    narrativeData,
    'player',
    'prompt-container',
    'prompt-text',
    'decision-container',
    'restartButton',
    'goBackButton',
    'start-screen'
);

interactiveStory.init();
