//module CocaineCartels {
//    "use strict";

//    export class TweenCreator {
//        constructor(
//            node: Konva.Node,
//            settings: ITweenSettings
//        ) {
//            this.settings = settings;
//            this.settings.node = node;
//            this.settings.duration = CanvasSettings.tweenDuration;
//        }

//        private settings: any;
//        private tween: Konva.Tween;

//        public createAndPlay() {
//            this.tween = new Konva.Tween(this.settings);
//            this.tween.play();
//        }

//        public destroy() {
//            this.tween.reset();
//            this.tween.destroy();
//        }
//    }
//}
