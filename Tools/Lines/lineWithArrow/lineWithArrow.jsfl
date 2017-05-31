/*
	Fichier du code d'un outil pour l'environnement Flash écrit en JSFL.
	Cet outil permet de dessiner une ligne avec une flèche filaire à l'une des extrêmités.
	Le module et l'angle de la flèche sont modifiables.
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
	angle = (theTool.angle * (2 * Math.PI)) / 360;
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
		
		point1 = {x:pt1.x, y:pt1.y};
		point2 = {x:pt2.x, y:pt2.y};
		
/* 		if ((fl.tools.shiftIsDown) && (!fl.tools.altIsDown)) {
			if(absdx > absdy) {
				point2.y = point1.y + (absdx * (dy > 0? 1 : -1));
			} else {
				point2.x = point1.x + (absdy * (dx > 0? 1 : -1));
			}
		} 
		else if ((fl.tools.shiftIsDown)&&(fl.tools.altIsDown)) {
		
			var longueur = Math.sqrt(Math.pow(absdx,2)+Math.pow(absdy,2));
			var angleLine = Math.acos(absdx/longueur);
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
			
		}  */
		//else if ((!fl.tools.altIsDown)&&(fl.tools.ctlIsDown)) {

			//changelineWithArrowsAngle(pt2);

		//} 
		//else if ((fl.tools.altIsDown)&&(fl.tools.ctlIsDown)) {

			//changelineWithArrowsModule(pt2);

		//} 
	
		if ((absdx > 2) || (absdy > 2)) {
			didDrag = true;
			buildlineWithArrowsObj(point1,  point2);
			fl.drawingLayer.beginFrame();
			drawlineWithArrowsObj()
			fl.drawingLayer.endFrame();
		}
		else
		{
			didDrag = false;
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
		didDrag = false;
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
Fonction qui calcul les points pour le dessin de la ligne avec sa flèche.
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
	if ((dy<0)&&(dx<0)){
		angleLine = ((Math.PI/2-angleLine) + Math.PI/2);
	}
	if ((dy>=0)&&(dx<=0)){
		angleLine = (angleLine + Math.PI);
	}
	if ((dy>=0)&&(dx>0)){
		angleLine = ((Math.PI/2-angleLine) + 3*Math.PI/2);
	}
	var offsetX1=0;
	var offsetY1=0;
	var offsetX2=0;
	var offsetY2=0;
	var offsetX3=0;
	var offsetY3=0;
	var offsetX4=0;
	var offsetY4=0;
	//
	if (origine) {
		offsetX1 = (module * Math.cos(2*Math.PI-(angle+angleLine)));
		offsetY1 = (module * Math.sin(2*Math.PI-(angle+angleLine)));
		offsetX2 = (module * Math.cos(2*Math.PI-(angleLine-angle)));
		offsetY2 = (module * Math.sin(2*Math.PI-(angleLine-angle)));
	}
	//
	if (!origine) {
		offsetX3 = (module * Math.cos(2*Math.PI-(angle+angleLine)));
		offsetY3 = (module * Math.sin(2*Math.PI-(angle+angleLine)));
		offsetX4 = (module * Math.cos(2*Math.PI-(angleLine-angle)));
		offsetY4 = (module * Math.sin(2*Math.PI-(angleLine-angle)));
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
	thelineWithArrows[1][0] = pt1.x+offsetX1;
	thelineWithArrows[1][1] = pt1.y+offsetY1;
	thelineWithArrows[1][2] = pt1.x;
	thelineWithArrows[1][3] = pt1.y;
	thelineWithArrows[1][4] = pt1.x+offsetX2;
	thelineWithArrows[1][5] = pt1.y+offsetY2;
	//
	thelineWithArrows[2][0] = pt2.x-offsetX3;
	thelineWithArrows[2][1] = pt2.y-offsetY3;
	thelineWithArrows[2][2] = pt2.x;
	thelineWithArrows[2][3] = pt2.y;
	thelineWithArrows[2][4] = pt2.x-offsetX4;
	thelineWithArrows[2][5] = pt2.y-offsetY4;
	return;
}
/*
Fonction de dessin de la ligne avec sa flèche sur le DrawingLayer.
*/
function drawlineWithArrowsObj()
{
	if (thelineWithArrows[0].length != 0){
		DrawingLayerMoveTo(0,0);
		DrawingLayerLineTo(0,2);		
		DrawingLayerMoveTo(1,0);		
		DrawingLayerLineTo(1,2);		
		DrawingLayerLineTo(1,4);		
		DrawingLayerMoveTo(2,0);
		DrawingLayerLineTo(2,2);
		DrawingLayerLineTo(2,4);
	}
}
/*
Fonction dessinant une ligne sur le DrawingLayer.
*/
function DrawingLayerLineTo(index1, index2)
{
	var tmpPt  = new Object();
	var viewMat = fl.getDocumentDOM().viewMatrix;
	tmpPt.x = thelineWithArrows[index1][index2];
	tmpPt.y = thelineWithArrows[index1][index2+1];
	transformPoint(tmpPt,  viewMat);
	fl.drawingLayer.lineTo(tmpPt.x,  tmpPt.y);	
}
/*
Fonction déplaçant la position courante sur le DrawingLayer.
*/
function DrawingLayerMoveTo(index1, index2)
{
	var tmpPt  = new Object();
	var viewMat = fl.getDocumentDOM().viewMatrix;
	tmpPt.x = thelineWithArrows[index1][index2];	
	tmpPt.y = thelineWithArrows[index1][index2+1];
	transformPoint(tmpPt,  viewMat);
	fl.drawingLayer.moveTo(tmpPt.x,  tmpPt.y);
}
/*
Fonction retournant le "path" pour le dessin de la ligne sur la scène courante.
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
Fonction modifiant l'angle de la flèche.
*/
function changelineWithArrowsAngle(pt2)
{
	var incx = (pt2.x - refPoint.x) * 0.005;
	
	angle = savedAngle + incx;
	
	if (angle < 0) angle = 0;
	if (angle > Math.PI/2) angle = Math.PI/2;
	if (update) {
		var theTool = fl.tools.activeTool;
		theTool.angle = Math.floor((angle/(2*Math.PI))*360);
	}
}
/*
Fonction modifiant le module de la flèche.
*/
var maxModule = 999;
function changelineWithArrowsModule(pt2) {
	var incx = (pt2.x - refPoint.x) * 0.5;
	
	module = savedModule + incx;
	
	if (module < 0) angle = 0;
	if (module > maxModule) module = maxModule;
	if (update) {
		var theTool = fl.tools.activeTool;
		theTool.module = module;
	}
}

/*
Fonction calculant les coordonnées x et y d'un point en fonction de la matrice de vue.
*/
function transformPoint(pt, mat)
{
	var x = pt.x*mat.a + pt.y*mat.c + mat.tx;
	var y = pt.x*mat.b + pt.y*mat.d + mat.ty;
	
	pt.x = x;
	pt.y = y;

	return;
}