(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-7d6470f8"],{"46d2":function(t,e,a){"use strict";var i=a("5c69"),n=a.n(i);n.a},"5c69":function(t,e,a){},"9d01":function(t,e,a){},b73d:function(t,e,a){"use strict";a("0481"),a("4069");var i=a("5530"),n=(a("ec29"),a("9d01"),a("4de4"),a("45fc"),a("d3b7"),a("25f0"),a("c37a")),r=a("5607"),s=a("2b0e"),o=s["default"].extend({name:"rippleable",directives:{ripple:r["a"]},props:{ripple:{type:[Boolean,Object],default:!0}},methods:{genRipple:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return this.ripple?(t.staticClass="v-input--selection-controls__ripple",t.directives=t.directives||[],t.directives.push({name:"ripple",value:{center:!0}}),t.on=Object.assign({click:this.onChange},this.$listeners),this.$createElement("div",t)):null},onChange:function(){}}}),l=a("80d2"),c=s["default"].extend({name:"comparable",props:{valueComparator:{type:Function,default:l["i"]}}}),u=a("58df"),d=Object(u["a"])(n["a"],o,c).extend({name:"selectable",model:{prop:"inputValue",event:"change"},props:{id:String,inputValue:null,falseValue:null,trueValue:null,multiple:{type:Boolean,default:null},label:String},data:function(){return{hasColor:this.inputValue,lazyValue:this.inputValue}},computed:{computedColor:function(){if(this.isActive)return this.color?this.color:this.isDark&&!this.appIsDark?"white":"primary"},isMultiple:function(){return!0===this.multiple||null===this.multiple&&Array.isArray(this.internalValue)},isActive:function(){var t=this,e=this.value,a=this.internalValue;return this.isMultiple?!!Array.isArray(a)&&a.some((function(a){return t.valueComparator(a,e)})):void 0===this.trueValue||void 0===this.falseValue?e?this.valueComparator(e,a):Boolean(a):this.valueComparator(a,this.trueValue)},isDirty:function(){return this.isActive},rippleState:function(){return this.isDisabled||this.validationState?this.validationState:void 0}},watch:{inputValue:function(t){this.lazyValue=t,this.hasColor=t}},methods:{genLabel:function(){var t=this,e=n["a"].options.methods.genLabel.call(this);return e?(e.data.on={click:function(e){e.preventDefault(),t.onChange()}},e):e},genInput:function(t,e){return this.$createElement("input",{attrs:Object.assign({"aria-checked":this.isActive.toString(),disabled:this.isDisabled,id:this.computedId,role:t,type:t},e),domProps:{value:this.value,checked:this.isActive},on:{blur:this.onBlur,change:this.onChange,focus:this.onFocus,keydown:this.onKeydown},ref:"input"})},onBlur:function(){this.isFocused=!1},onChange:function(){var t=this;if(this.isInteractive){var e=this.value,a=this.internalValue;if(this.isMultiple){Array.isArray(a)||(a=[]);var i=a.length;a=a.filter((function(a){return!t.valueComparator(a,e)})),a.length===i&&a.push(e)}else a=void 0!==this.trueValue&&void 0!==this.falseValue?this.valueComparator(a,this.trueValue)?this.falseValue:this.trueValue:e?this.valueComparator(a,e)?null:e:!a;this.validate(!0,a),this.internalValue=a,this.hasColor=a}},onFocus:function(){this.isFocused=!0},onKeydown:function(t){}}}),p=a("c3f0"),h=a("0789"),m=a("490a");e["a"]=d.extend({name:"v-switch",directives:{Touch:p["a"]},props:{inset:Boolean,loading:{type:[Boolean,String],default:!1},flat:{type:Boolean,default:!1}},computed:{classes:function(){return Object(i["a"])(Object(i["a"])({},n["a"].options.computed.classes.call(this)),{},{"v-input--selection-controls v-input--switch":!0,"v-input--switch--flat":this.flat,"v-input--switch--inset":this.inset})},attrs:function(){return{"aria-checked":String(this.isActive),"aria-disabled":String(this.isDisabled),role:"switch"}},validationState:function(){return this.hasError&&this.shouldValidate?"error":this.hasSuccess?"success":null!==this.hasColor?this.computedColor:void 0},switchData:function(){return this.setTextColor(this.loading?void 0:this.validationState,{class:this.themeClasses})}},methods:{genDefaultSlot:function(){return[this.genSwitch(),this.genLabel()]},genSwitch:function(){return this.$createElement("div",{staticClass:"v-input--selection-controls__input"},[this.genInput("checkbox",Object(i["a"])(Object(i["a"])({},this.attrs),this.attrs$)),this.genRipple(this.setTextColor(this.validationState,{directives:[{name:"touch",value:{left:this.onSwipeLeft,right:this.onSwipeRight}}]})),this.$createElement("div",Object(i["a"])({staticClass:"v-input--switch__track"},this.switchData)),this.$createElement("div",Object(i["a"])({staticClass:"v-input--switch__thumb"},this.switchData),[this.genProgress()])])},genProgress:function(){return this.$createElement(h["c"],{},[!1===this.loading?null:this.$slots.progress||this.$createElement(m["a"],{props:{color:!0===this.loading||""===this.loading?this.color||"primary":this.loading,size:16,width:2,indeterminate:!0}})])},onSwipeLeft:function(){this.isActive&&this.onChange()},onSwipeRight:function(){this.isActive||this.onChange()},onKeydown:function(t){(t.keyCode===l["q"].left&&this.isActive||t.keyCode===l["q"].right&&!this.isActive)&&this.onChange()}}})},ec29:function(t,e,a){},fc6a8:function(t,e,a){"use strict";a.r(e);var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"page-index"},[a("div",{staticClass:"center"},[a("h1",{staticClass:"sitename"},[t._v("测试账号")]),a("p",[a("b",[t._v("最近更新: ")]),t._v(t._s(t.BuildTime))])]),a("v-form",{ref:"form",staticStyle:{"padding-left":"20px","padding-right":"20px"},attrs:{"lazy-validation":""}},[a("v-text-field",{attrs:{required:"",label:"基准价格(USD)",type:"number",outlined:""},model:{value:t.params.BasePrice,callback:function(e){t.$set(t.params,"BasePrice",e)},expression:"params.BasePrice"}}),a("v-slider",{attrs:{label:"基准价格权重","thumb-label":"always","thumb-size":30,min:0,max:1,step:.1},model:{value:t.params.BasePriceWeight,callback:function(e){t.$set(t.params,"BasePriceWeight",e)},expression:"params.BasePriceWeight"}}),a("span",[t._v("基准价格权重不为1时，")]),a("span",[t._v("上下限价格将根据最近24小时成交均价偏移")]),a("br"),a("br"),a("v-text-field",{attrs:{required:"",label:"【上限价格】，此价格，持【上限仓位】(USD)",type:"number",outlined:""},model:{value:t.params.MaxPrice,callback:function(e){t.$set(t.params,"MaxPrice",e)},expression:"params.MaxPrice"}}),a("v-text-field",{attrs:{required:"",label:"【上限仓位】负为空(张)",type:"number",outlined:""},model:{value:t.params.MaxPosition,callback:function(e){t.$set(t.params,"MaxPosition",e)},expression:"params.MaxPosition"}}),a("v-text-field",{attrs:{required:"",label:"【下限价格】，此价格，持【下限仓位】(USD)",type:"number",outlined:""},model:{value:t.params.MinPrice,callback:function(e){t.$set(t.params,"MinPrice",e)},expression:"params.MinPrice"}}),a("v-text-field",{attrs:{required:"",label:"【下限仓位】负为空(张)",type:"number",outlined:""},model:{value:t.params.MinPosition,callback:function(e){t.$set(t.params,"MinPosition",e)},expression:"params.MinPosition"}}),a("v-text-field",{attrs:{required:"",label:"单次挂单上限(张)",type:"number",outlined:""},model:{value:t.params.MaxStepVol,callback:function(e){t.$set(t.params,"MaxStepVol",e)},expression:"params.MaxStepVol"}}),a("v-text-field",{attrs:{required:"",label:"偏移金额撤单(USD)",type:"number",outlined:""},model:{value:t.params.OverStepChange,callback:function(e){t.$set(t.params,"OverStepChange",e)},expression:"params.OverStepChange"}}),a("v-text-field",{attrs:{required:"",label:"下单偏移金额(USD)",type:"number",outlined:""},model:{value:t.params.GridDiff,callback:function(e){t.$set(t.params,"GridDiff",e)},expression:"params.GridDiff"}}),a("v-text-field",{attrs:{required:"",label:"api key",type:"text",outlined:""},model:{value:t.params.Key,callback:function(e){t.$set(t.params,"Key",e)},expression:"params.Key"}}),a("v-switch",{staticClass:"ma-2",attrs:{label:"策略运行"},model:{value:t.params.Runner,callback:function(e){t.$set(t.params,"Runner",e)},expression:"params.Runner"}}),a("v-btn",{staticClass:"mr-4",attrs:{color:"success"},on:{click:t.validate}},[t._v("保存")])],1),a("div",{staticClass:"section"},[a("v-dialog",{ref:"dialog",attrs:{color:"primary","return-value":t.Dates,persistent:""},on:{"update:returnValue":function(e){t.Dates=e},"update:return-value":function(e){t.Dates=e}},scopedSlots:t._u([{key:"activator",fn:function(e){var i=e.on,n=e.attrs;return[a("v-text-field",t._g(t._b({attrs:{label:"日期选择","prepend-icon":"mdi-calendar-range",readonly:""},model:{value:t.Dates,callback:function(e){t.Dates=e},expression:"Dates"}},"v-text-field",n,!1),i))]}}]),model:{value:t.modal,callback:function(e){t.modal=e},expression:"modal"}},[a("v-date-picker",{attrs:{range:"",scrollable:"",min:t.DateMin,max:t.DateMax},model:{value:t.Dates,callback:function(e){t.Dates=e},expression:"Dates"}},[a("v-spacer"),a("v-btn",{attrs:{text:"",color:"primary"},on:{click:function(e){t.modal=!1}}},[t._v("取消")]),a("v-btn",{attrs:{text:"",color:"primary"},on:{click:t.Submit}},[t._v("确定")])],1)],1),a("div",{ref:"MyAccount",staticClass:"echarts",staticStyle:{"padding-top":"10px"}}),a("div",{ref:"MyAccountDetail",staticClass:"echarts",staticStyle:{"padding-top":"40px"}}),a("v-slider",{attrs:{"thumb-label":"always","thumb-size":60,min:t.detailMin,max:t.detailMax,step:.5},scopedSlots:t._u([{key:"prepend",fn:function(){return[a("v-icon",{attrs:{color:"primary"},on:{click:function(e){t.detailValue-=.5}}},[t._v(" mdi-minus ")])]},proxy:!0},{key:"append",fn:function(){return[a("v-icon",{attrs:{color:"primary"},on:{click:function(e){t.detailValue+=.5}}},[t._v(" mdi-plus ")])]},proxy:!0}]),model:{value:t.detailValue,callback:function(e){t.detailValue=e},expression:"detailValue"}}),a("div",{ref:"MyAccountReport",staticClass:"echarts",staticStyle:{"padding-top":"40px"}})],1)],1)},n=[],r=(a("99af"),a("4de4"),a("4160"),a("d81d"),a("a434"),a("b0c0"),a("ac1f"),a("5319"),a("159b"),a("2909")),s=a("53ca"),o=(a("96cf"),a("1da1")),l=a("d4ec"),c=a("bee2"),u=a("262e"),d=a("2caf"),p=a("9ab4"),h=a("60a3"),m=a("36c1"),f=a("313e"),v=a.n(f),b=a("a7a6"),y=null,g=null,x=null,w=Object(m["a"])(Date.now(),"yyyy-MM-dd"),S=Object(m["a"])(new Date(2020,7,7),"yyyy-MM-dd"),M=new Date(S).getTime(),D=function(){var t=new Date,e=new Date;return e.setDate(t.getDate()-2),e.getTime()<M&&e.setTime(M),[Object(m["a"])(e,"yyyy-MM-dd"),w]},k={},C=function(t){Object(u["a"])(a,t);var e=Object(d["a"])(a);function a(){var t;return Object(l["a"])(this,a),t=e.apply(this,arguments),t.modal=!1,t.DateMin=S,t.DateMax=w,t.Times=D(),t.Dates=D(),t.params={MinPrice:11600,MinPosition:1e3,MaxPrice:12e3,MaxPosition:-200,MaxStepVol:100,OverStepChange:4,Runner:!0,Key:h["b"].AppStore.localState.UserKey,BasePrice:11700,BasePriceWeight:1,GridDiff:1},t.paramsAutoPrice="固定区间模式",t.paramsAutoPrices=["固定区间模式","24H均价移动区间模式"],t.detailValue=0,t.detailMin=1/0,t.detailMax=0,t.SnapshotData=[],t.Runder3=Object(b["throttle"])((function(){if(x){var t=k[this.detailValue],e=function(){};if(!t)return e();var a=-1,i=t.details.filter((function(t){return t.BtcSum!==a&&(a=t.BtcSum,!0)}));if(i.length<2)return e();var n=i[i.length-1].BtcSum,r=i[i.length-1].BtcSum-i[0].BtcSum,s=("".concat(t.price," USD 资产变更"),"".concat(t.price," USD 资产变更: ").concat(r," (").concat(Math.floor(r/n*1e4)/100,"%)"));console.log(t),x.setOption({legend:{data:["资产","24H均价","持仓"]},title:{subtext:s},xAxis:{data:i.map((function(t){return Object(m["a"])(t.Ts,"hh:mm:ss\r\nMM-dd")}))},series:[{name:"资产",yAxisIndex:1,type:"line",data:i.map((function(t){return t.BtcSum})),areaStyle:{color:"rgba(4, 100, 100, 0.3)"}},{name:"24H均价",type:"line",data:i.map((function(t){return t.p24h}))}]})}}),1e3),t}return Object(c["a"])(a,[{key:"detailValueChange",value:function(){this.Runder3()}},{key:"mounted",value:function(){this.mountedd()}},{key:"mountedd",value:function(){var t=Object(o["a"])(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:this.GetParams(),this.GetData(this.Times[0]),this.RenderInit();case 3:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()},{key:"Submit",value:function(){var t=Object(o["a"])(regeneratorRuntime.mark((function t(){var e,a,i;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return this.$refs.dialog.save(this.Dates),e=new Date(this.Dates[0]),a=new Date(this.Dates[1]),e.getTime()>a.getTime()&&(i=e.getTime(),e.setTime(a.getTime()),a.setTime(i)),this.Times=[Object(m["a"])(e,"yyyy-MM-dd"),Object(m["a"])(a,"yyyy-MM-dd")],this.SnapshotData=[],t.next=8,this.GetData(this.Times[0]);case 8:this.Render();case 9:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()},{key:"RenderInit",value:function(){this.SnapshotData=[],y=v.a.init(this.$refs.MyAccount),y.setOption({tooltip:{trigger:"axis",axisPointer:{type:"cross",label:{backgroundColor:"#6a7985"}}},legend:{data:["24H均价","现价","资产BTC","持仓","目标持仓"],selected:{"24H均价":!0,"现价":!0,"资产BTC":!0,"持仓":!0,"目标持仓":!1}},dataZoom:[{show:!0,start:0,end:100}],grid:{left:"20px",right:"14px",bottom:"40px",containLabel:!0},title:{text:"",subtext:"账户资产走势",top:4},xAxis:[{type:"category",boundaryGap:!1}],yAxis:[{type:"value",position:"left",name:"价格: USD",axisLabel:{formatter:"{value}"},min:"dataMin",max:"dataMax",splitLine:{show:!1}},{type:"value",position:"right",name:"账户权益: BTC",axisLabel:{formatter:"{value}"},min:function(t){return Math.floor(1e4*t.min)/1e4},splitLine:{show:!1}},{type:"value",offset:50,position:"right",name:"持仓金额: USD",axisLabel:{formatter:"{value}"},splitLine:{show:!1},inverse:!0}]}),g=v.a.init(this.$refs.MyAccountReport),g.setOption({tooltip:{trigger:"axis",axisPointer:{type:"cross",label:{backgroundColor:"#6a7985"}}},legend:{data:["资产变更"]},dataZoom:[{show:!0,start:33,end:66}],grid:{left:"20px",right:"14px",bottom:"40px",containLabel:!0},title:{text:"",subtext:"资产-价格变更趋势",top:4},xAxis:[{type:"category",boundaryGap:!1,scale:!0,axisLine:{onZero:!1},splitLine:{show:!1},min:"dataMin",max:"dataMax"}],yAxis:[{scale:!0,splitArea:{show:!0}}]}),x=v.a.init(this.$refs.MyAccountDetail),x.setOption({tooltip:{trigger:"axis",axisPointer:{type:"cross",label:{backgroundColor:"#6a7985"}}},legend:{data:["资产变更-详情"]},grid:{left:"20px",right:"14px",bottom:"40px",containLabel:!0},title:{text:"",subtext:"资产-变更记录",top:4},xAxis:[{type:"category",boundaryGap:!1,scale:!0,axisLine:{onZero:!1},splitLine:{show:!1},min:"dataMin",max:"dataMax"}],yAxis:[{type:"value",position:"left",name:"价格: USD",axisLabel:{formatter:"{value}"},min:"dataMin",splitLine:{show:!1}},{type:"value",position:"right",name:"账户权益: BTC",axisLabel:{formatter:"{value}"},min:function(t){return Math.floor(1e4*t.min)/1e4},splitLine:{show:!1}}]})}},{key:"Render",value:function(){var t=this;if(y&&g&&x){var e=[{name:"资产BTC",type:"line",color:"rgba(4, 100, 100, 0.3)",areaStyle:{color:"rgba(4, 100, 100, 0.3)"},key:"BtcSum",y:1},{name:"24H均价",type:"line",color:"#666666",key:"p24h",y:0},{name:"现价",type:"line",color:"rgba(4, 164, 204, 1)",key:"Price",y:0},{name:"持仓",type:"line",color:"#ff0099",key:"quantity",y:2},{name:"目标持仓",type:"line",color:"#ff9900",key:"WantPos",y:2}],a={};e.forEach((function(t){a[t.name]={yAxisIndex:t.y,name:t.name,type:t.type,data:[],color:t.color,areaStyle:t.areaStyle}}));var i=[];k={};var n=[];this.SnapshotData.forEach((function(r){r.data.forEach((function(r){e.forEach((function(t){var e=r[t.key];if("WantPos"===t.key&&"object"===Object(s["a"])(e))return a[t.name].data.push(e[0]);a[t.name].data.push(e)})),i.push(Object(m["a"])(r.Ts,"hh:mm:ss\r\nMM-dd"));var o=k[r.Price];if(!o)return k[r.Price]={low:r.BtcSum,high:r.BtcSum,open:r.BtcSum,close:r.BtcSum,price:r.Price,details:[r]},void n.push(k[r.Price]);o.low=Math.min(o.low,r.BtcSum),o.high=Math.max(o.high,r.BtcSum),o.close=r.BtcSum,o.details.push(r),t.detailMax=Math.max(t.detailMax,r.Price),t.detailMin=Math.min(t.detailMin,r.Price)}))}));var o=0;n.forEach((function(t){var e=t.close,a=t.low,i=t.high,r=n[o++];r.low=a,r.high=i,r.close=e})),n.splice(o,n.length-o),n.sort((function(t,e){return t.price-e.price})),console.log(n),y.setOption({xAxis:{data:i},series:Object(r["a"])(e.map((function(t){return a[t.name]})))});var l="#ec0000",c="#8A0000",u="#00da3c",d="#008F28";g.setOption({xAxis:{data:n.map((function(t){return t.price}))},series:[{name:"资产变更",type:"candlestick",data:n.map((function(t){return[t.open,t.close,t.low,t.high]})),itemStyle:{color:l,color0:u,borderColor:c,borderColor0:d}}]});var p=this.SnapshotData[this.SnapshotData.length-1];if(p&&p.data.length){var h=p.data[p.data.length-1].Price;console.log(h),this.detailValue=h}}}},{key:"GetData",value:function(){var t=Object(o["a"])(regeneratorRuntime.mark((function t(e){var a,i,n,r,s,o=arguments;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(a=o.length>1&&void 0!==o[1]?o[1]:1,!(a>5)){t.next=3;break}return t.abrupt("return");case 3:return i=e.replace(/-/g,"/"),t.next=6,this.$AnalysisStore.GetJson("https://fmex-database.oss-cn-qingdao.aliyuncs.com/report/9f19f869ad1cc4adbbfc10f509a6fad6/"+i);case 6:if(n=t.sent,n){t.next=9;break}return t.abrupt("return",this.GetData(e,++a));case 9:if(this.SnapshotData.push({time:e,data:n}),r=new Date(e),s=new Date(r.getTime()+864e5),!(s.getTime()<=new Date(this.Times[1]).getTime())){t.next=14;break}return t.abrupt("return",this.GetData(Object(m["a"])(s,"yyyy-MM-dd")));case 14:return this.Render(),t.abrupt("return",!0);case 16:case"end":return t.stop()}}),t,this)})));function e(e){return t.apply(this,arguments)}return e}()},{key:"GetParams",value:function(){var t=Object(o["a"])(regeneratorRuntime.mark((function t(){var e;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,this.$AnalysisStore.GetJson("https://fmex-database.oss-cn-qingdao.aliyuncs.com/report/".concat(this.$AppStore.localState.KeyDecode,"/config"));case 2:if(e=t.sent,e){t.next=5;break}return t.abrupt("return");case 5:Object.assign(this.params,e);case 6:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()},{key:"validate",value:function(){var t=Object(o["a"])(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:this.$AppStore.localState.UserKey=this.params.Key,location.href="".concat(this.$AppStore.localState.ServerUrl,"/grid/set-params");case 2:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}()},{key:"BuildTime",get:function(){var t="__Build_Time__"===window.__Build_Time?Date.now():parseInt(window.__Build_Time,10);return Object(m["a"])(t,"yyyy-MM-dd hh:mm")}}]),a}(h["b"]);Object(p["a"])([Object(h["c"])("detailValue")],C.prototype,"detailValueChange",null),C=Object(p["a"])([Object(h["a"])({components:{}})],C);var V=C,B=V,O=(a("46d2"),a("2877")),_=a("6544"),P=a.n(_),A=a("8336"),j=a("2e4b"),$=a("169a"),T=(a("7db0"),a("caad"),a("07ac"),a("2532"),a("5530")),R=a("58df"),L=a("7e2b"),E=a("3206"),G=Object(R["a"])(L["a"],Object(E["b"])("form")).extend({name:"v-form",provide:function(){return{form:this}},inheritAttrs:!1,props:{disabled:Boolean,lazyValidation:Boolean,readonly:Boolean,value:Boolean},data:function(){return{inputs:[],watchers:[],errorBag:{}}},watch:{errorBag:{handler:function(t){var e=Object.values(t).includes(!0);this.$emit("input",!e)},deep:!0,immediate:!0}},methods:{watchInput:function(t){var e=this,a=function(t){return t.$watch("hasError",(function(a){e.$set(e.errorBag,t._uid,a)}),{immediate:!0})},i={_uid:t._uid,valid:function(){},shouldValidate:function(){}};return this.lazyValidation?i.shouldValidate=t.$watch("shouldValidate",(function(n){n&&(e.errorBag.hasOwnProperty(t._uid)||(i.valid=a(t)))})):i.valid=a(t),i},validate:function(){return 0===this.inputs.filter((function(t){return!t.validate(!0)})).length},reset:function(){this.inputs.forEach((function(t){return t.reset()})),this.resetErrorBag()},resetErrorBag:function(){var t=this;this.lazyValidation&&setTimeout((function(){t.errorBag={}}),0)},resetValidation:function(){this.inputs.forEach((function(t){return t.resetValidation()})),this.resetErrorBag()},register:function(t){this.inputs.push(t),this.watchers.push(this.watchInput(t))},unregister:function(t){var e=this.inputs.find((function(e){return e._uid===t._uid}));if(e){var a=this.watchers.find((function(t){return t._uid===e._uid}));a&&(a.valid(),a.shouldValidate()),this.watchers=this.watchers.filter((function(t){return t._uid!==e._uid})),this.inputs=this.inputs.filter((function(t){return t._uid!==e._uid})),this.$delete(this.errorBag,e._uid)}}},render:function(t){var e=this;return t("form",{staticClass:"v-form",attrs:Object(T["a"])({novalidate:!0},this.attrs$),on:{submit:function(t){return e.$emit("submit",t)}}},this.$slots.default)}}),q=a("132d"),I=a("ba0d"),U=a("2fa4"),K=a("b73d"),z=a("8654"),F=Object(O["a"])(B,i,n,!1,null,"5c9674a8",null);e["default"]=F.exports;P()(F,{VBtn:A["a"],VDatePicker:j["a"],VDialog:$["a"],VForm:G,VIcon:q["a"],VSlider:I["a"],VSpacer:U["a"],VSwitch:K["a"],VTextField:z["a"]})}}]);
//# sourceMappingURL=chunk-7d6470f8.a70cbece.js.map