define('ace/theme/lich3', ['require', 'exports', 'module' , 'ace/lib/dom'], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-lich3";
exports.cssText = ".ace-lich3,\
.ace-lich3 {\
  background: transparent;\
  color: #333;\
  width:100%;\
  height:100%;\
  position:absolute;\
  opacity: 0.0;\
}\
\
.ace_gutter {\
  background:#222\
  color:#1414\
}\
\
.ace-lich3 .ace_print-margin {\
  width: 1px;\
  background: #e8e8e8\
}\
\
.ace-lich3 {\
  background-color: transparent;\
  color: #f1e3e2\
}\
\
.ace-lich3 .ace_constant,\
.ace-lich3 .ace_cursor,\
.ace-lich3 .ace_storage {\
  color: #913333\
}\
\
.ace-lich3 .ace_marker-layer .ace_selection {\
  background: #61595a\
}\
\
.ace-lich3.ace_multiselect .ace_selection.ace_start {\
  box-shadow: 0 0 3px 0px #141414;\
  border-radius: 2px\
}\
\
.ace-lich3 .ace_marker-layer .ace_step {\
  background: rgb(198, 219, 174)\
}\
\
.ace-lich3 .ace_marker-layer .ace_bracket {\
  margin: -1px 0 0 -1px;\
  border: 1px solid #8a8585\
}\
\
.ace-lich3 .ace_marker-layer .ace_active-line {\
  background: rgba(255, 255, 255, 0.051)\
}\
\
.ace-lich3 .ace_gutter-active-line {\
  background-color: rgba(255, 255, 255, 0.051)\
}\
\
.ace-lich3 .ace_marker-layer .ace_selected-word {\
  border: 1px solid #61595a\
}\
\
.ace-lich3 .ace_fold {\
  background-color: #309090;\
  border-color: #f1e3e2\
}\
\
.ace-lich3 .ace_keyword {\
  color: #AA6a50;\
}\
\
.ace-lich3 .ace_string,\
.ace-lich3 .ace_string.ace_regexp,\
.ace-lich3 .ace_support,\
.ace-lich3 .ace_variable {\
  color: #959068\
}\
\
.ace-lich3 .ace_support.ace_function {\
  color: #907674\
}\
\
.ace-lich3 .ace_support.ace_constant {\
  color: #9E51CF\
}\
\
.ace-lich3 .ace_invalid {\
  color: #F8F8F8;\
  background-color: #D2A8A1\
}\
\
.ace-lich3 .ace_comment {\
  font-style: italic;\
  color: #969896\
}\
\
.ace-lich3 .ace_meta.ace_tag {\
  color: #CC6666\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
