define('ace/theme/lich2', ['require', 'exports', 'module' , 'ace/lib/dom'], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-lich2";
exports.cssText = ".ace-lich2,\
.ace-lich2 {\
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
.ace-lich2 .ace_print-margin {\
  width: 1px;\
  background: #e8e8e8\
}\
\
.ace-lich2 {\
  background-color: transparent;\
  color: #f1e3e2\
}\
\
.ace-lich2 .ace_constant,\
.ace-lich2 .ace_cursor,\
.ace-lich2 .ace_storage {\
  color: #706590\
}\
\
.ace-lich2 .ace_marker-layer .ace_selection {\
  background: #61595a\
}\
\
.ace-lich2.ace_multiselect .ace_selection.ace_start {\
  box-shadow: 0 0 3px 0px #141414;\
  border-radius: 2px\
}\
\
.ace-lich2 .ace_marker-layer .ace_step {\
  background: rgb(198, 219, 174)\
}\
\
.ace-lich2 .ace_marker-layer .ace_bracket {\
  margin: -1px 0 0 -1px;\
  border: 1px solid #8a8585\
}\
\
.ace-lich2 .ace_marker-layer .ace_active-line {\
  background: rgba(255, 255, 255, 0.051)\
}\
\
.ace-lich2 .ace_gutter-active-line {\
  background-color: rgba(255, 255, 255, 0.051)\
}\
\
.ace-lich2 .ace_marker-layer .ace_selected-word {\
  border: 1px solid #61595a\
}\
\
.ace-lich2 .ace_fold {\
  background-color: #309090;\
  border-color: #f1e3e2\
}\
\
.ace-lich2 .ace_keyword {\
  color: #7d987d;\
}\
\
.ace-lich2 .ace_string,\
.ace-lich2 .ace_string.ace_regexp,\
.ace-lich2 .ace_support,\
.ace-lich2 .ace_variable {\
  color: #af6d6a\
}\
\
.ace-lich2 .ace_support.ace_function {\
  color: #9B859D\
}\
\
.ace-lich2 .ace_support.ace_constant {\
  color: #AF7EA9\
}\
\
.ace-lich2 .ace_invalid {\
  color: #F8F8F8;\
  background-color: #D2A8A1\
}\
\
.ace-lich2 .ace_comment {\
  font-style: italic;\
  color: #555\
}\
\
.ace-lich2 .ace_meta.ace_tag {\
  color: #666\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
