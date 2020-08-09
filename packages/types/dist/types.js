/*!
 * @pixi-essentials/types - v0.0.1-alpha.0
 * Compiled Sun, 09 Aug 2020 15:59:00 UTC
 *
 * @pixi-essentials/types is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 * 
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_types=function(t){"use strict";class s{constructor(t){this.current=null,this.done=!1,this.start=t}next(){return null===this.current?this.current=this.start:this.current.next!==this.start?this.current=this.current.next:(this.current=null,this.done=!0),{value:this.current,done:this.done}}reset(t=this.start){return this.current=null,this.done=!1,this.start=t,this}}class r{constructor(t){this.head=t}[Symbol.iterator](){return this._sharedIterator||(this._sharedIterator=new s(this.head)),this._sharedIterator.reset(this.head),this._sharedIterator}}return t.CircularLinkedList=r,t.CircularLinkedListIterator=s,t}({});Object.assign(this.PIXI,_pixi_essentials_types);
//# sourceMappingURL=types.js.map
