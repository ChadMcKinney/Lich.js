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
  background:#333\
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
  color: #CF6A4C\
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
  color: #CDA869\
}\
\
.ace-lich3 .ace_string,\
.ace-lich3 .ace_string.ace_regexp,\
.ace-lich3 .ace_support,\
.ace-lich3 .ace_variable {\
  color: #AC885B\
}\
\
.ace-lich3 .ace_support.ace_function {\
  color: #DAD085\
}\
\
.ace-lich3 .ace_support.ace_constant {\
  color: #CDA869\
}\
\
.ace-lich3 .ace_invalid {\
  color: #F8F8F8;\
  background-color: rgba(86, 45, 86, 0.75)\
}\
\
.ace-lich3 .ace_comment {\
  font-style: italic;\
  color: #5F5A60\
}\
\
.ace-lich3 .ace_meta.ace_tag {\
  color: #F9EE98\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
