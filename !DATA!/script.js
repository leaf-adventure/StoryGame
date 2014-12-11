//  This file is used to initialize the engine_ Prefixes tell the engine where to find files,
//  while Effect.loadScene loads the first scene_

Game.init = function() {
    Game.background_prefix = "!DATA!/backgrounds/";
    Game.music_prefix = "!DATA!/music/";
    Game.ambience_prefix = "!DATA!/ambience/";
    Game.scene_prefix = "!DATA!/scenes/";
    Game.portrait_prefix = "!DATA!/portraits/";
    Effect.loadScene("sample.xml");
}

document.addEventListener("DOMContentLoaded", Scene.init, false);
