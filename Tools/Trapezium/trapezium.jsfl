/*
	Fichier du code d'un outil pour l'environnement Flash écrit en JSFL.
	Cet outil permet de dessiner un trapèze.
	Johann Bescond, juin 2017
*/

/*
	Variables globales de l'outil
*/

var didDrag = false;
var insidePercent = 0.5;
var thetrapezium = [[0],[0]];
var offsetX = 0.5;
var upLine = 0.5;
var update = false;

/*
Fonction appelée à l'ouverture de Flash et lorsque l'outil extensible est chargé dans le panneau Outils. Elle permet de
définir toutes les informations dont Flash a besoin à propos de cet outil.
*/
function configureTool()
{
	var theTool = fl.tools.activeTool;
	theTool.setToolName("trapezium Tool");
	theTool.setMenuString("trapezium Tool");
	theTool.setToolTip("trapezium Tool");
	theTool.setIcon("trapezium.png");
	theTool.setOptionsFile("trapezium.xml");
	
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
	offsetX = theTool.offsetX/100;
	upLine = theTool.upLine/100;
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
function activate(){}
/*
Cette fonction est appelée lorsque l’outil extensible est désactivé (c’est-à-dire lorsque l’utilisateur sélectionne un autre
outil). Elle permet d’effectuer toute opération de nettoyage nécessaire avant la désactivation de cet outil.
*/
function deactivate(){}
/*
Cette fonction est appelée si l’outil extensible est actif lors d’un clic de souris alors que le pointeur se trouve sur la scène.
*/
function mouseDown()
{
	fl.drawingLayer.beginDraw();
	didDrag = false;
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
		
		if (fl.tools.shiftIsDown)
		{
			point1 = {x:pt1.x, y:pt1.y};
			point2 = {x:pt2.x, y:pt2.y};
			
			if(absdx > absdy)
				point2.y = point1.y + (absdx * (dy > 0? 1 : -1));
			else
				point2.x = point1.x + (absdy * (dx > 0? 1 : -1));
		}
		else if (fl.tools.ctlIsDown)
		{
			changetrapeziumWidth(pt2);
		}
		else if (fl.tools.altIsDown)
		{
			changetrapeziumOffset(pt2);
		}
		else 
		{
			point1 = {x:pt1.x, y:pt1.y};
			point2 = {x:pt2.x, y:pt2.y};
		}
		
		if ((absdx > 2) || (absdy > 2))
		{
			didDrag = true;
			buildtrapeziumObj(point1,  point2)
			fl.drawingLayer.beginFrame();
			drawtrapeziumObj()
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
		var path = trapeziumToPath();
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
		savedPercent = insidePercent;
		savedOffsetX = offsetX;
		savedUpLine = upLine;
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
function keyUp(){}

/*
	Functions spécifiques de l'outil
*/

/*
Fonction qui calcul les points pour le dessin de la ligne avec sa flèche.
*/
function buildtrapeziumObj(pt1,  pt2){
	//
	var dx = pt2.x-pt1.x;
	var dy = pt2.y-pt1.y;
	var upX = dx*upLine;
	var ofX = upX*(1-offsetX);
	// Quatre points sont nécessaires
	thetrapezium[0][0] = pt1.x+ofX;
	thetrapezium[0][1] = pt1.y;
	thetrapezium[0][2] = pt1.x+ofX+upX;
	thetrapezium[0][3] = pt1.y;
	thetrapezium[0][4] = pt2.x;
	thetrapezium[0][5] = pt2.y;
	thetrapezium[0][6] = pt1.x;
	thetrapezium[0][7] = pt2.y;
	thetrapezium[0][8] = pt1.x+ofX;
	thetrapezium[0][9] = pt1.y;
	return;
}
/*
*/
function drawtrapeziumObj()
{
	if (thetrapezium[0].length != 0){
		var tmpPt  = new Object();
		var viewMat = fl.getDocumentDOM().viewMatrix;
		tmpPt.x = thetrapezium[0][0];
		tmpPt.y = thetrapezium[0][1];
		transformPoint(tmpPt,  viewMat);
		fl.drawingLayer.moveTo(tmpPt.x,  tmpPt.y);
		for (var i=2; i<thetrapezium[0].length; i+=2) {
			tmpPt.x = thetrapezium[0][i];
			tmpPt.y = thetrapezium[0][i+1];
			transformPoint(tmpPt,  viewMat);
			fl.drawingLayer.lineTo(tmpPt.x,  tmpPt.y);
		}
		return;
	}
}

/*
*/
function trapeziumToPath()
{
	var path = fl.drawingLayer.newPath();
	for (var i=0; i<thetrapezium[0].length;i+=2){
		path.addPoint( thetrapezium[0][i],  thetrapezium[0][i+1]);
	}
	path.close();
	return path;
}
/*
*/
function changetrapeziumWidth(pt1)
{
	var incx = (pt1.x - refPoint.x) * 0.005;
	upLine = savedUpLine + incx
	if (upLine < -10) upLine = 0;
	if (upLine > 10) upLine = 1;
	if (update) {
		var theTool = fl.tools.activeTool;
		theTool.offsetX = offsetX*100;
		theTool.upLine = upLine*100;
	}
	return;
}
/*
*/
function changetrapeziumOffset(pt1){
	var incx = (pt1.x - refPoint.x) * 0.005;
	offsetX = savedOffsetX + incx
	if (offsetX < -10) offsetX = 0;
	if (offsetX > 10) offsetX = 1;
	if (update) {
		var theTool = fl.tools.activeTool;
		theTool.offsetX = offsetX*100;
		theTool.upLine = upLine*100;
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