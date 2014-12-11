var Scene = {
    init: function() {
        document.body.textContent = null;
        Scene.background_container = document.createElement("div");
        Scene.background_container.id = "background_container";
        document.body.appendChild(Scene.background_container);
        Scene.textbox = document.createElement("div");
        Scene.textbox.id = "textbox";
        document.body.appendChild(Scene.textbox);
        Scene.interactbox = document.createElement("div");
        Scene.interactbox.id = "interactbox";
        document.body.appendChild(Scene.interactbox);
        Scene.music = document.createElement("audio");
        Scene.music.loop = true;
        Scene.music.preload = "auto";
        Scene.ambience = document.createElement("audio");
        Scene.ambience.loop = true;
        Scene.ambience.preload = "auto";
        Scene.portraits = {
            "null": Scene.createPortrait(null)
        };
        Game.init();
        document.documentElement.addEventListener("click", Scene.advance, false);
    },
    setup: function() {
        Scene.current_element = null;
        if (Scene.document.documentElement.hasAttribute("background")) Effect.changeBackground(Scene.document.documentElement.getAttribute("background"), false);
        if (Scene.document.documentElement.hasAttribute("music")) Effect.changeMusic(Scene.document.documentElement.getAttribute("music"), false);
        else Effect.stopMusic(null, false);
        if (Scene.document.documentElement.hasAttribute("ambience")) Effect.changeAmbience(Scene.document.documentElement.getAttribute("ambience"), false);
        else Effect.stopAmbience(null, false);
        Scene.textbox.textContent = null;
        Scene.interactbox.textContent = null;
        Scene.portraits = {null: Scene.createPortrait(null)};
        window.setTimeout(Scene.advance, 1000);
    },
    advance: function() {
        if (!Scene.waiting && !Scene.interactbox.childElementCount && Scene.current_element != Scene.document.documentElement.lastElementChild && (!Scene.textbox.childElementCount || Scene.duration_forced || window.getComputedStyle(Scene.textbox.lastElementChild).opacity == 1)) {
            if (Scene.current_element == null) Scene.current_element = Scene.document.documentElement.firstElementChild;
            else Scene.current_element = Scene.current_element.nextElementSibling;
            switch (Scene.current_element.tagName) {
                case "menu":
                    break;
                case "do":
                    Effect[Scene.current_element.getAttribute("function")](Scene.current_element.getAttribute("withParameter"), true);
                    break;
                case "portrait":
                    if (!Scene.portraits[Scene.current_element.getAttribute("name")]) Scene.portraits[Scene.current_element.getAttribute("name")] = Scene.createPortrait(Scene.current_element.getAttribute("src"));
                    else Scene.portraits[Scene.current_element.getAttribute("name")].src = Game.portrait_prefix + Scene.current_element.getAttribute("src");
                    window.requestAnimationFrame(Scene.advance);
                    break;
                case "dialogue":
                    if (Scene.textbox.children.length == 0) Scene.textbox.appendChild(Scene.portraits[Scene.current_element.getAttribute("speaker")]);
                    else if (Scene.textbox.firstElementChild != Scene.portraits[Scene.current_element.getAttribute("speaker")]) Scene.textbox.insertBefore(Scene.portraits[Scene.current_element.getAttribute("speaker")], Scene.textbox.firstElementChild);
                    var dialogue = document.createElement("div");
                    if (Scene.current_element.hasAttribute("speaker")) dialogue.dataset.name = Scene.current_element.getAttribute("speaker");
                    dialogue.textContent = Scene.current_element.textContent;
                    dialogue.addEventListener("webkitTransitionEnd", Scene.onTransitionEnd, false);
                    dialogue.addEventListener("transitionend", Scene.onTransitionEnd, false);
                    Scene.textbox.appendChild(dialogue);
                    if (Scene.current_element.hasAttribute("forceDuration")) {
                        Effect.wait(Scene.current_element.getAttribute("forceDuration"));
                        Scene.duration_forced = true;
                    }
                    else Scene.duration_forced = false;
                    break;
                case "interact":
                    Scene.interactbox.textContent = null;
                    for (var i = 0; i < Scene.current_element.childElementCount; i++) {
                        var interact = document.createElement("span");
                        interact.className = "interact";
                        interact.textContent = Scene.current_element.children.item(i).textContent;
                        interact.dataset.func = Scene.current_element.children.item(i).getAttribute("do");
                        interact.dataset.param = Scene.current_element.children.item(i).getAttribute("withParameter");
                        interact.addEventListener("click", function() {Effect[this.dataset.func](this.dataset.param, true); Scene.interactbox.textContent = null}, false);
                        Scene.interactbox.appendChild(interact);
                    }
                    break;
                case "if":
                    var statement = Scene.current_element.getAttribute("statement").split(":", 2);
                    var value = Number(statement[1]);
                    if (isNaN(value)) value = Number(Game.variables[statement[1]]);
                    var result = false;
                    switch (current_element.getAttribute("matches")) {
                        case "equalTo":
                            result = Number(Game.variables[statement[0]]) == value;
                            break;
                        case "lessThan":
                            result = Number(Game.variables[statement[0]]) < value;
                            break;
                        case "greaterThan":
                            result = Number(Game.variables[statement[0]]) > value;
                            break;
                        case "lessThanEqualTo":
                            result = Number(Game.variables[statement[0]]) <= value;
                            break;
                        case "greaterThanEqualTo":
                            result = Number(Game.variables[statement[0]]) >= value;
                            break;
                        case "notEqualTo":
                            result = Number(Game.variables[statement[0]]) != value;
                            break;
                    }
                    if (result) Effect[Scene.current_element.getAttribute("do")](Scene.current_element.getAttribute("withParameter"));
                default:
                    window.requestAnimationFrame(Scene.advance);
                    break;
            }
        }
    },
    background_container: null,
    textbox: null,
    interactbox : null,
    portraits: null,
    music: null,
    ambience: null,
    document: null,
    current_element : null,
    waiting: false,
    duration_forced: false,
    createPortrait : function (src) {
        var portrait = document.createElement("img");
        portrait.className = "portrait";
        if (src != null) portrait.src = Game.portrait_prefix + src;
        else portrait.src = "";
        portrait.addEventListener("webkitTransitionEnd", Scene.onTransitionEnd, false);
        portrait.addEventListener("transitionend", Scene.onTransitionEnd, false);
        return portrait;
    },
    onTransitionEnd : function () {
        if (this.parentNode && window.getComputedStyle(this).visibility == "hidden") this.parentNode.removeChild(this);
    }
}

var Game = {
    init: null,
    background_prefix: "",
    scene_prefix: "",
    music_prefix: "",
    ambience_prefix: "",
    portrait_prefix: "",
    variables: {}
}

var Request = new XMLHttpRequest();
Request.addEventListener("load", function() {Scene.document = this.responseXML; Scene.setup()}, false);

var Effect = {
    wait: function(parameter, advance) {
        Scene.waiting = window.setTimeout(function(){Scene.waiting = false; Scene.advance();}, Number(parameter));
    },
    goTo: function(parameter, advance) {
        if (Scene.document.documentElement.children.namedItem(parameter)) Scene.current_element = Scene.document.documentElement.children.namedItem(parameter);
        if (advance) Scene.advance();
    },
    loadScene: function(parameter, advance) {
        Request.open("GET", Game.scene_prefix + parameter);
        Request.send();
    },
    changeBackground: function(parameter, advance) {
        var background = document.createElement("div");
        background.style.backgroundImage = "url('" + Game.background_prefix + parameter + "')";
        background.addEventListener("webkitTransitionEnd", Scene.onTransitionEnd, false);
        background.addEventListener("transitionend", Scene.onTransitionEnd, false);
        Scene.background_container.appendChild(background);
        if (advance) Scene.advance();
    },
    changeMusic: function(parameter, advance) {
        Scene.music.pause();
        Scene.music.src = Game.music_prefix + parameter;
        Scene.music.load();
        Scene.music.play();
        if (advance) Scene.advance();
    },
    stopMusic: function(parameter, advance) {
        Scene.music.pause();
        if (advance) Scene.advance();
    },
    changeAmbience: function(parameter, advance) {
        Scene.ambience.pause();
        Scene.ambience.src = Game.ambience_prefix + parameter;
        Scene.ambience.load();
        Scene.ambience.play();
        if (advance) Scene.advance();
    },
    stopAmbience: function(parameter, advance) {
        Scene.ambience.pause();
        if (advance) Scene.advance();
    },
    setVariable: function(parameter, advance) {
        var value = Number(parameter.split(":", 2)[1]);
        if (isNaN(value)) value = Number(Game.variables[parameter.split(":", 2)[1]]);
        Game.variables[parameter.split(":", 2)[0]] = value;
        if (advance) Scene.advance();
    },
    changeVariable: function(parameter, advance) {
        var value = Number(parameter.split(":", 2)[1]);
        if (isNaN(value)) value = Number(Game.variables[parameter.split(":", 2)[1]]);
        Game.variables[parameter.split(":", 2)[0]] = Number(Game.variables[parameter.split(":", 2)[0]]) + value;
        if (advance) Scene.advance();
    },
    clearDialogue: function(parameter, advance) {
        if (Scene.textbox.children.length == 0) Scene.textbox.appendChild(Scene.portraits[null]);
        else if (Scene.textbox.firstElementChild != Scene.portraits[null]) Scene.textbox.insertBefore(Scene.portraits[null], Scene.textbox.firstElementChild);
        var dialogue = document.createElement("div");
        dialogue.addEventListener("webkitTransitionEnd", Scene.onTransitionEnd, false);
        dialogue.addEventListener("transitionend", Scene.onTransitionEnd, false);
        Scene.textbox.appendChild(dialogue);
        Scene.duration_forced = true;
        if (advance) Scene.waiting = window.setTimeout(function(){Scene.waiting = false; Scene.textbox.textContent = null; Scene.advance()}, 500);
        else Scene.waiting = window.setTimeout(function(){Scene.waiting = false; Scene.textbox.textContent = null;}, 500);
    },
    nothing: function(parameter, advance) {
        if (advance) Scene.advance();
    }
}
