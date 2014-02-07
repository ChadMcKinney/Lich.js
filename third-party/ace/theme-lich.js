define('ace/theme/lich', ['require', 'exports', 'module' , 'ace/lib/dom'], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-lich";
exports.cssText = ".ace-lich,\
.ace-lich {\
  background: transparent;\
  color: #333;\
  width:100%;\
  height:100%;\
  position:absolute;\
  opacity: 0.0;\
}\
\
.ace_gutter {\
  background:#333\
  color:#1414\
}\
\
.ace-lich .ace_print-margin {\
  width: 1px;\
  background: #e8e8e8\
}\
\
.ace-lich {\
  background-color: transparent;\
  color: #f1e3e2\
}\
\
.ace-lich .ace_constant,\
.ace-lich .ace_cursor,\
.ace-lich .ace_storage {\
  color: #902550\
}\
\
.ace-lich .ace_marker-layer .ace_selection {\
  background: #61595a\
}\
\
.ace-lich.ace_multiselect .ace_selection.ace_start {\
  box-shadow: 0 0 3px 0px #141414;\
  border-radius: 2px\
}\
\
.ace-lich .ace_marker-layer .ace_step {\
  background: rgb(198, 219, 174)\
}\
\
.ace-lich .ace_marker-layer .ace_bracket {\
  margin: -1px 0 0 -1px;\
  border: 1px solid #8a8585\
}\
\
.ace-lich .ace_marker-layer .ace_active-line {\
  background: rgba(255, 255, 255, 0.051)\
}\
\
.ace-lich .ace_gutter-active-line {\
  background-color: rgba(255, 255, 255, 0.051)\
}\
\
.ace-lich .ace_marker-layer .ace_selected-word {\
  border: 1px solid #61595a\
}\
\
.ace-lich .ace_fold {\
  background-color: #309090;\
  border-color: #f1e3e2\
}\
\
.ace-lich .ace_keyword {\
  color: #309090\
}\
\
.ace-lich .ace_string,\
.ace-lich .ace_string.ace_regexp,\
.ace-lich .ace_support,\
.ace-lich .ace_variable {\
  color: #4ea683\
}\
\
.ace-lich .ace_support.ace_function {\
  color: #7cccd1\
}\
\
.ace-lich .ace_support.ace_constant {\
  color: #C03050\
}\
\
.ace-lich .ace_invalid {\
  color: #F8F8F8;\
  background-color: rgba(216, 41, 13, 0.75)\
}\
\
.ace-lich .ace_comment {\
  font-style: italic;\
  color: #8a8585\
}\
\
.ace-lich .ace_meta.ace_tag {\
  color: #7cffd1\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
