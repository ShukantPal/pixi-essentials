/*!
 * @pixi-essentials/types - v0.0.1
 * Compiled Sat, 15 Aug 2020 19:41:52 UTC
 *
 * @pixi-essentials/types is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_types=function(t){"use strict";class r{constructor(t){this.current=null,this.done=!1,this.start=t}next(){return null===this.current?this.current=this.start:this.current.next!==this.start?this.current=this.current.next:(this.current=null,this.done=!0),{value:this.current,done:this.done}}reset(t=this.start){return this.current=null,this.done=!1,this.start=t,this}}class s{constructor(t){this.head=t}[Symbol.iterator](){return this._sharedIterator||(this._sharedIterator=new r(this.head)),this._sharedIterator.reset(this.head),this._sharedIterator}}class e{constructor(t){this.head=t}add(t,r=this.head){return t.next=r,t.previous=r.previous,r.previous=t,this}forEach(t){const r=this.head;let s=r;do{t(s),s=s.next}while(s!==r)}[Symbol.iterator](){return this._sharedIterator||(this._sharedIterator=new r(this.head)),this._sharedIterator.reset(this.head),this._sharedIterator}}return t.CircularDoublyLinkedList=e,t.CircularLinkedList=s,t.CircularLinkedListIterator=r,t}({});Object.assign(this.PIXI,_pixi_essentials_types);
//# sourceMappingURL=types.js.map
