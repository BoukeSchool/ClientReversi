let myApp = {
	init: function(){return true;}
}

let show = function(){
	fbw = new FeedbackWidget("feedback-success");
	// fbw.show(this.elementId)
	if(document.getElementById("feedback-success") != null){
		return document.getElementById(fbw.elementId).style.display;
	}
	else{
		return "niks";
	}

}


