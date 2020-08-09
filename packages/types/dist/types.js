/*!
 * @pixi-essentials/types - v0.0.1-alpha.0
 * Compiled Sun, 09 Aug 2020 02:07:48 UTC
 *
 * @pixi-essentials/types is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 * 
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_types=function(t){"use strict";var n=function(){function t(t){this.current=null,this.done=!1,this.start=t}return t.prototype.next=function(){return null===this.current?this.current=this.start:this.current.next!==this.start?this.current=this.current.next:(this.current=null,this.done=!0),{value:this.current,done:this.done}},t}();return t.CircularLinkedListIterator=n,t}({});Object.assign(this.PIXI,_pixi_essentials_types);
//# sourceMappingURL=types.js.map
