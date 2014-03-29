/*
  minify script for Lich.js
  requires node-minify via npm
*/

var minify = require('node-minify');

var lichFiles = [
	"../Compiler/Objects.js",
	"../Compiler/VM.js",
	"../Compiler/Compiler.js",
	"../third-party/AudioContextMonkeyPatch.js",
	"../Soliton.js/Soliton.js",
	"../CloudChamber.js/CloudChamber.js",
	"../Parser/ParseUtility.js",
	"../Parser/Types.js",
	"../Parser/Lexeme.js",
	"../Parser/preL.js",
	"../Parser/iterL.js",
	"../Parser/parse.js",
	"../Parser/LichParser.js",
	"../Parser/LichLibraryParser.js",
	"../Library/Prelude.js",
	"../Lich.js",
	"../Networking/LichClient.js",
	"../Networking/LichChat.js",
	"../Networking/LichTerminal.js"
];


// Using Google Closure Compiler
new minify.minify({
    type: 'gcc',
    fileIn: lichFiles,
    fileOut: '../lich.min.js',
	options: ["--compilation_level WHITESPACE_ONLY"], // Simple minification to retain original argument names to functions
    callback: function(err, min){
        console.log(err);
    }
});

/* Uncomment to run minify shaders
var lichShaders = [
	"../third-party/three.js/postprocessing/EffectComposer.js",
	"../third-party/three.js/postprocessing/RenderPass.js",
	"../third-party/three.js/postprocessing/MaskPass.js",
	"../third-party/three.js/postprocessing/ShaderPass.js",
	"../third-party/three.js/shaders/BasicShader.js",
	"../third-party/three.js/shaders/BleachBypassShader.js",
	"../third-party/three.js/shaders/BlendShader.js",
	"../third-party/three.js/shaders/BokehShader.js",
	"../third-party/three.js/shaders/BrightnessContrastShader.js",
	"../third-party/three.js/shaders/ColorCorrectionShader.js",
	"../third-party/three.js/shaders/ColorifyShader.js",
	"../third-party/three.js/shaders/ConvolutionShader.js",
	"../third-party/three.js/shaders/CopyShader.js",
	"../third-party/three.js/shaders/DOFMipMapShader.js",
	"../third-party/three.js/shaders/DotScreenShader.js",
	"../third-party/three.js/shaders/EdgeShader.js",
	"../third-party/three.js/shaders/EdgeShader2.js",
	"../third-party/three.js/shaders/FilmShader.js",
	"../third-party/three.js/shaders/FocusShader.js",
	"../third-party/three.js/shaders/FresnelShader.js",
	"../third-party/three.js/shaders/FXAAShader.js",
	"../third-party/three.js/shaders/HorizontalBlurShader.js",
	"../third-party/three.js/shaders/HorizontalTiltShiftShader.js",
	"../third-party/three.js/shaders/HueSaturationShader.js",
	"../third-party/three.js/shaders/KaleidoShader.js",
	"../third-party/three.js/shaders/LuminosityShader.js",
	"../third-party/three.js/shaders/MirrorShader.js",
	"../third-party/three.js/shaders/NormalMapShader.js",
	"../third-party/three.js/shaders/RGBShiftShader.js",
	"../third-party/three.js/shaders/SepiaShader.js",
	"../third-party/three.js/shaders/SSAOShader.js",
	"../third-party/three.js/shaders/TriangleBlurShader.js",
	"../third-party/three.js/shaders/UnpackDepthRGBAShader.js",
	"../third-party/three.js/shaders/VerticalBlurShader.js",
	"../third-party/three.js/shaders/VerticalTiltShiftShader.js",
	"../third-party/three.js/shaders/VignetteShader.js"
];

// Using Google Closure Compiler
new minify.minify({
    type: 'gcc',
    fileIn: lichShaders,
    fileOut: '../CloudChamber.js/lich.shaders.min.js',
	callback: function(err, min){
        console.log(err);
    }
});
*/
