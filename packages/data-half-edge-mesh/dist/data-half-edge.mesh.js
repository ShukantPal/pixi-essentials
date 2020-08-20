/*!
 * @pixi-essentials/data-half-edge-mesh - v1.0.2
 * Compiled Thu, 20 Aug 2020 15:33:06 UTC
 *
 * @pixi-essentials/data-half-edge-mesh is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Shukant K. Pal, All Rights Reserved
 */
this.PIXI=this.PIXI||{};var _pixi_essentials_data_half_edge_mesh=function(t){"use strict";class e{constructor(t){this.current=null,this.face=t,this.done=!1}next(){return this.current?this.current.next!==this.face.anEdge?this.current=this.current.next:(this.current=null,this.done=!0):this.current=this.face.anEdge,{value:this.current,done:this.done}}reset(){return this.current=null,this.done=!1,this}}class r{constructor(t){this.data=t}connect(t){return this.anEdge=t,this}[Symbol.iterator](){return this._edgeLoopIterator||(this._edgeLoopIterator=new e(this)),this._edgeLoopIterator}}return t.EdgeLoopIterator=e,t.Face=r,t.HalfEdge=class{constructor(t){this.data=t,this._onext=this}connect(t,e,r){return this._origin=t,this._twin=e,this._leftFace=r,this}get previous(){return this._twin.next}get org(){return this._origin}get dst(){return this._twin._origin}get dnext(){return this.rnext.twin}get dlast(){return this.lnext.twin}get onext(){return this._onext}get oprev(){return this.twin.lnext}get lnext(){return this._lnext}get lprev(){return this._onext.twin}get rnext(){return this.oprev.twin}get rlast(){return this.twin.onext}get twin(){return this._twin}get leftFace(){return this._leftFace}get rightFace(){return this._twin.leftFace}},t.Vertex=class{constructor(t){this.data=t}connect(t){return this.anEdge=t,this}},t}({});Object.assign(this.PIXI,_pixi_essentials_data_half_edge_mesh);
//# sourceMappingURL=data-half-edge.mesh.js.map
