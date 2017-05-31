/*
	Fichier représentant le squelette d'un outil en JSFL pour l'environnement Flash.
	Johann Bescond, mai 2017
*/

/*
	Variables globales de l'outil
*/

var didDrag = false;
var thelineWithArrows = [[0],[0],[0]];
var module = 10;
var angle = Math.PI/4;
var origine = false;
var update = false;

/*
Fonction appelée à l'ouverture de Flash et lorsque l'outil extensible est chargé dans le panneau Outils. Elle permet de
définir toutes les informations dont Flash a besoin à propos de cet outil.
*/
function configureTool()
{
	var theTool = fl.tools.activeTool;
	theTool.setToolName("lineWithArrow Tool");
	theTool.setMenuString("lineWithArrow Tool");
	theTool.setToolTip("Line with arrows tool.");
	theTool.setIcon("lineWithArrow.png");
	theTool.setOptionsFile("lineWithArrow.xml");
	theTool.showPIControl( "fill", false );

	theTool.setPI("shape");
}
/*
Cette fonction est appelée lorsqu’un outil est actif et que l’utilisateur en modifie les options dans l’inspecteur
Propriétés. Vous pouvez utiliser la propriété tools.activeTool pour demander les valeurs actuelles des options (voir
tools.activeTool).
*/ 
function notifySettingsChanged()
{
	var theTool = fl.tools.activeTool;
	module = theTool.module;
	angle = (theTool.angle*(2*Math.PI))/360;
	origine = theTool.origine;
	update = theTool.update;
}
/*
Cette fonction est appelée lorsque l'outil extensible est actif et que l'utilisateur déplace sa souris, ce qui permet au script
de définir des pointeurs personnalisés. Le script doit appeler tools.setCursor() pour désigner le pointeur à utiliser.
La liste des pointeurs et des valeurs entières correspondantes figure dans la section tools.setCursor().
*/
function setCursor()
{
	fl.tools.setCursor( 0 ); // type du curseur
}
/*
Fonction appelée lorsque l’outil extensible est activé (c’est-à-dire lorsqu’il est sélectionné dans le panneau Outils).
Cette fonction vous permet d'exécuter toute tâche d'initialisation requise par l'outil.
*/
function activate()
{
	// statements
}
/*
Cette fonction est appelée lorsque l’outil extensible est désactivé (c’est-à-dire lorsque l’utilisateur sélectionne un autre
outil). Elle permet d’effectuer toute opération de nettoyage nécessaire avant la désactivation de cet outil.
*/
function deactivate()
{
	// statements
}
/*
Cette fonction est appelée si l’outil extensible est actif lors d’un clic de souris alors que le pointeur se trouve sur la scène.
*/
function mouseDown()
{
	fl.drawingLayer.beginDraw();
	didDrag = false;
}
/*
Fonction appelée lorsque l'outil extensible est actif et que l'utilisateur double-clique sur la scène.
*/
function mouseDoubleClick() 
{
	// statements
}

/*
Fonction appelée lorsque l'outil extensible est actif et que l'utilisateur survole un point précis de la scène avec sa souris.
Le ou les boutons de la souris peuvent être enfoncés ou non.
*/
function mouseMove(mouseLoc)
{
	if (fl.tools.mouseIsDown)
	{
		var pt1 = fl.tools.penDownLoc;
		var pt2 = fl.tools.snapPoint(mouseLoc);
		var dx = pt2.x - pt1.x;
		var dy = pt2.y - pt1.y;
		var absdx = Math.abs(dx);
		var absdy = Math.abs(dy);
		var point1;
		var point2;
		
		if ((fl.tools.shiftIsDown) && (!fl.tools.altIsDown)) {
			point1 = {x:pt1.x, y:pt1.y};
			point2 = {x:pt2.x, y:pt2.y};
			if(absdx > absdy) {
				point2.y = point1.y + (absdx * (dy > 0? 1 : -1));
			} else {
				point2.x = point1.x + (absdy * (dx > 0? 1 : -1));
			}
		} 
		else if ((fl.tools.shiftIsDown)&&(fl.tools.altIsDown)) {
			point1 = {x:pt1.x, y:pt1.y};
			point2 = {x:pt2.x, y:pt2.y};
			
			var longueur = Math.sqrt(Math.pow(absdx,2)+Math.pow(absdy,2));
			var angleLine = Math.acos(absdx/longueur);
			//
			//
			//
			if ((dy<0)&&(dx<0)){
				angleLine = ((Math.PI/2-angleLine) + Math.PI/2);
			}
			if ((dy>=0)&&(dx<=0)){
				angleLine = (angleLine + Math.PI);
			}
			if ((dy>=0)&&(dx>0)){
				angleLine = ((Math.PI/2-angleLine) + 3*Math.PI/2);
			}
			
			if (((angleLine>(7*Math.PI/4))&&(angleLine<=(Math.PI/4)))||((angleLine>(3*Math.PI/4))&&(angleLine<=(5*Math.PI/4)))){
				point2.y = point1.y;
			}
			if (((angleLine>(Math.PI/4))&&(angleLine<=(3*Math.PI/4)))||((angleLine>(5*Math.PI/4))&&(angleLine<=(7*Math.PI/4)))){
				point2.x = point1.x;
			}
			
		} 
		else if ((!fl.tools.altIsDown)&&(fl.tools.ctlIsDown)) {

			changelineWithArrowsAngle(pt2);

		} 
		else if ((fl.tools.altIsDown)&&(fl.tools.ctlIsDown)) {

			changelineWithArrowsModule(pt2);

		} 
		else {

			point1 = {x:pt1.x, y:pt1.y};
			point2 = {x:pt2.x, y:pt2.y};

		}
		
		if ((absdx > 2) || (absdy > 2)) {
			didDrag = true;
			buildlineWithArrowsObj(point1,  point2);
			fl.drawingLayer.beginFrame();
			drawlineWithArrowsObj()
			fl.drawingLayer.endFrame();
		}
	}
}
/*
Fonction appelée lorsque l'outil extensible est actif et que l'utilisateur relâche le bouton de sa souris après avoir cliqué
sur la scène.
*/
function mouseUp()
{
	fl.drawingLayer.endDraw();
	
	if (didDrag)
	{
		var path = lineWithArrowsToPath();
		path.makeShape();
	}
}
/*
Cette fonction est appelée si l’outil extensible est actif lorsque l’utilisateur appuie sur une touche. Le script doit alors
appeler tools.getKeyDown() pour identifier la touche en question.
*/
function keyDown()
{
	if (fl.tools.mouseIsDown)
	{
		savedAngle = angle;
		savedModule = module;
		refPoint = fl.tools.penLoc;
	}
	if (fl.tools.getKeyDown() == 67){
		var theTool = fl.tools.activeTool;
		if (!update) {
			update = true;
			theTool.update = true;
		} else {
			update = false;
			theTool.update = false;
		}
	}
}
/*
Cette fonction est appelée si l’outil extensible est actif lorsque l’utilisateur relâche une touche.
*/
function keyUp()
{
}

/*
	Functions spécifiques de l'outil
*/

/*
*/
function buildlineWithArrowsObj(pt1,  pt2){
	//
	var dx = pt2.x - pt1.x;
	var dy = pt2.y - pt1.y;
	var absdx = Math.abs(dx);
	var absdy = Math.abs(dy);
	var longueur = Math.sqrt(Math.pow(absdx,2)+Math.pow(absdy,2));
	var angleLine = Math.acos(absdx/longueur);
	//
	//
	//
	if ((dy<0)&&(dx<0)){
		angleLine = ((Math.PI/2-angleLine) + Math.PI/2);
	}
	if ((dy>=0)&&(dx<=0)){
		angleLine = (angleLine + Math.PI);
	}
	if ((dy>=0)&&(dx>0)){
		angleLine = ((Math.PI/2-angleLine) + 3*Math.PI/2);
	}
	var ofX1=0;
	var ofY1=0;
	var ofX2=0;
	var ofY2=0;
	var ofX3=0;
	var ofY3=0;
	var ofX4=0;
	var ofY4=0;
	//
	if (origine) {
		ofX1 = (module * Math.cos(2*Math.PI-(angle+angleLine)));
		ofY1 = (module * Math.sin(2*Math.PI-(angle+angleLine)));
		ofX2 = (module * Math.cos(2*Math.PI-(angleLine-angle)));
		ofY2 = (module * Math.sin(2*Math.PI-(angleLine-angle)));
	}
	//
	if (!origine) {
		ofX3 = (module * Math.cos(2*Math.PI-(angle+angleLine)));
		ofY3 = (module * Math.sin(2*Math.PI-(angle+angleLine)));
		ofX4 = (module * Math.cos(2*Math.PI-(angleLine-angle)));
		ofY4 = (module * Math.sin(2*Math.PI-(angleLine-angle)));
	}
	//
	// Définition des deux points de la ligne
	//
	thelineWithArrows[0][0] = pt1.x;
	thelineWithArrows[0][1] = pt1.y;
	thelineWithArrows[0][2] = pt2.x;
	thelineWithArrows[0][3] = pt2.y;
	//
	// Définition des points des flèches
	//
	thelineWithArrows[1][0] = pt1.x+ofX1;
	thelineWithArrows[1][1] = pt1.y+ofY1;
	thelineWithArrows[1][2] = pt1.x;
	thelineWithArrows[1][3] = pt1.y;
	thelineWithArrows[1][4] = pt1.x+ofX2;
	thelineWithArrows[1][5] = pt1.y+ofY2;
	//
	thelineWithArrows[2][0] = pt2.x-ofX3;
	thelineWithArrows[2][1] = pt2.y-ofY3;
	thelineWithArrows[2][2] = pt2.x;
	thelineWithArrows[2][3] = pt2.y;
	thelineWithArrows[2][4] = pt2.x-ofX4;
	thelineWithArrows[2][5] = pt2.y-ofY4;
	return;
}
/*
*/
function drawlineWithArrowsObj()
{
	if (thelineWithArrows[0].length != 0){

		DrawingLayerMoveTo(0,0);
		
		//tmpPt.x = thelineWithArrows[0][0];
		//tmpPt.y = thelineWithArrows[0][1];
		//transformPoint(tmpPt,  viewMat);
		//fl.drawingLayer.moveTo(tmpPt.x,  tmpPt.y);
		
		DrawingLayerLineTo(0,2);
		
		//tmpPt.x = thelineWithArrows[0][2];
		//tmpPt.y = thelineWithArrows[0][3];
		//transformPoint(tmpPt,  viewMat);
		//fl.drawingLayer.lineTo(tmpPt.x,  tmpPt.y);
		
		DrawingLayerMoveTo(1,0);
		
		//tmpPt.x = thelineWithArrows[1][0];
		//tmpPt.y = thelineWithArrows[1][1];
		//transformPoint(tmpPt,  viewMat);
		//fl.drawingLayer.moveTo(tmpPt.x,  tmpPt.y);
		
		DrawingLayerLineTo(1,2);
		
		//tmpPt.x = thelineWithArrows[1][2];
		//tmpPt.y = thelineWithArrows[1][3];
		//transformPoint(tmpPt,  viewMat);
		//fl.drawingLayer.lineTo(tmpPt.x,  tmpPt.y);
		
		DrawingLayerLineTo(1,4);
		
		//tmpPt.x = thelineWithArrows[1][4];
		//tmpPt.y = thelineWithArrows[1][5];
		//transformPoint(tmpPt,  viewMat);
		//fl.drawingLayer.lineTo(tmpPt.x,  tmpPt.y);
		
		DrawingLayerMoveTo(2,0);
		
		//tmpPt.x = thelineWithArrows[2][0];
		//tmpPt.y = thelineWithArrows[2][1];
		//transformPoint(tmpPt,  viewMat);
		//fl.drawingLayer.moveTo(tmpPt.x,  tmpPt.y);
		
		DrawingLayerLineTo(2,2);
		
		//tmpPt.x = thelineWithArrows[2][2];
		//tmpPt.y = thelineWithArrows[2][3];
		//transformPoint(tmpPt,  viewMat);
		//fl.drawingLayer.lineTo(tmpPt.x,  tmpPt.y);	
		
		DrawingLayerLineTo(2,4);
		
		//tmpPt.x = thelineWithArrows[2][4];
		//tmpPt.y = thelineWithArrows[2][5];
		//transformPoint(tmpPt,  viewMat);
		//fl.drawingLayer.lineTo(tmpPt.x,  tmpPt.y);
		
		return;
	}
}
/*
*/
function DrawingLayerLineTo(index1, index2)
{
	var tmpPt  = new Object;
	var viewMat = fl.getDocumentDOM().viewMatrix;
	var tmpPt.x = thelineWithArrows[index1][index2];
	var tmpPt.y = thelineWithArrows[index1][index2+1];
	transformPoint(tmpPt,  viewMat);
	fl.drawingLayer.lineTo(tmpPt.x,  tmpPt.y);	
}
/*
*/
function DrawingLayerMoveTo(index1, index2)
{
	var tmpPt  = new Object;
	var viewMat = fl.getDocumentDOM().viewMatrix;
	var tmpPt.x = thelineWithArrows[index1][index2];
	var tmpPt.y = thelineWithArrows[index1][index2+1];
	transformPoint(tmpPt,  viewMat);
	fl.drawingLayer.MoveTo(tmpPt.x,  tmpPt.y);		
}
/*
*/
function lineWithArrowsToPath()
{
	var path = fl.drawingLayer.newPath();
	path.addPoint( thelineWithArrows[0][0],  thelineWithArrows[0][1]);
	path.addPoint( thelineWithArrows[0][2],  thelineWithArrows[0][3]);
	path.close();
	path.newContour();
	path.addPoint( thelineWithArrows[1][0],  thelineWithArrows[1][1]);	
	path.addPoint( thelineWithArrows[1][2],  thelineWithArrows[1][3]);
	path.addPoint( thelineWithArrows[1][4],  thelineWithArrows[1][5]);
	path.newContour();
	path.addPoint( thelineWithArrows[2][0],  thelineWithArrows[2][1]);	
	path.addPoint( thelineWithArrows[2][2],  thelineWithArrows[2][3]);
	path.addPoint( thelineWithArrows[2][4],  thelineWithArrows[2][5]);
	return path;
}
/*
*/
function changelineWithArrowsAngle(pt2)
{
	var incx = (pt2.x - refPoint.x) * 0.005;
	
	angle = savedAngle + incx;
	
	if (angle < 0) angle = 0;
	if (angle > Math.PI/2) angle = Math.PI/2;
	if (miseAJour) {
		var theTool = fl.tools.activeTool;
		theTool.angle = Math.floor((angle/(2*Math.PI))*360);
	}
	return;
}
/*
*/
function changelineWithArrowsModule(pt2) {
	var incx = (pt2.x - refPoint.x) * 0.5;
	
	module = savedModule + incx;
	
	if (module < 0) angle = 0;
	if (module > 999) module = 999;
	if (miseAJour) {
		var theTool = fl.tools.activeTool;
		theTool.module = module;
	}
	return;
}

/*

*/
function transformPoint(pt, mat)
{
	var x = pt.x*mat.a + pt.y*mat.c + mat.tx;
	var y = pt.x*mat.b + pt.y*mat.d + mat.ty;
	
	pt.x = x;
	pt.y = y;

	return;
}