﻿/*
	Fichier du code d'un outil pour l'environnement Flash écrit en JSFL.
	Cet outil permet de dessiner un trapèze.
	Johann Bescond, juin 2017
*/

/*
Classes
*/

/*
Point
*/
Point = function(X, Y){
	this.x = X;
	this.y = Y;
}
Point.x = 0;
Point.y = 0;
/*
Shape
*/
Shape = function(){}
// Tableau des points de la forme à dessiner.
Shape.Points = new Array();
/*
Fonction ajoutant un point à la forme.
*/
Shape.Add = function(X, Y)
{
	point = new Point(X, Y);
	Points.Push(point);
}
/*
Fonction dessinant une ligne sur le DrawingLayer.
*/
Shape.DrawingLayerLineTo = function(index1)
{
	var tmpPt  = new Object();
	var viewMat = fl.getDocumentDOM().viewMatrix;
	tmpPt.x = this.Points[index1].x;
	tmpPt.y = this.Points[index1].y;
	transformPoint(tmpPt,  viewMat);
	fl.drawingLayer.lineTo(tmpPt.x,  tmpPt.y);	
}
/*
Fonction déplaçant la position courante sur le DrawingLayer.
*/
Shape.DrawingLayerMoveTo = function(index1)
{
	var tmpPt  = new Object();
	var viewMat = fl.getDocumentDOM().viewMatrix;
	tmpPt.x = this.Points[index1].x;	
	tmpPt.y = this.Points[index1].y;
	transformPoint(tmpPt,  viewMat);
	fl.drawingLayer.moveTo(tmpPt.x,  tmpPt.y);
}

/*
Classe permettant de représenter un trapèze.
*/
Trapezium = new Shape();
// Héritage
var trapeziumClass = Trapezium.prototype;
/*
Propriétés
*/
trapeziumClass.UpLine = 0.5;
trapeziumClass.OffsetX = 0.5;
trapeziumClass.Inialized = false;
/*
Initialisation
*/
trapeziumClass.Build = function(pt1, pt2)
{
	var dx = pt2.x-pt1.x;
	var dy = pt2.y-pt1.y;
	var upX = dx*this.UpLine;
	var ofX = upX*(1-this.OffsetX);
	if(this.Points.Length != 4)
	{
		this.Add(pt1.x + ofX, pt1.y);
		this.Add(pt1.x + ofX + upL, pt1.y);
		this.Add(pt2.x, pt2.y);
		this.Add(pt1.x, pt2.y);			
	}
	else
	{
		this.Points[0].x = pt1.x + ofX;
		this.Points[0].y = pt1.y;
		this.Points[1].x = pt1.x + ofX + upL;
		this.Points[1].y = pt1.y;
		this.Points[2].x = pt2.x;
		this.Points[2].y = pt2.y
		this.Points[3].x = pt1.x;
		this.Points[3].y = pt2.y;
	}
	
	this.Inialized = true;
}
/*

*/
trapeziumClass.Drawing = function()
{
	
}
/*

*/
trapeziumClass.Path = function()
{
	
}
/*
	Variables globales de l'outil
*/

var didDrag = false;
var insidePercent = 0.5;
var thetrapezium = [[0],[0]];
var offsetX = 0.5;
var upLine = 0.5;
var update = false;

var trapezium = new Trapezium();

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
		point1 = {x:pt1.x, y:pt1.y};
		point2 = {x:pt2.x, y:pt2.y};
		
		if (fl.tools.shiftIsDown)
		{
			if(absdx > absdy)
				point2.y = point1.y + (absdx * (dy > 0? 1 : -1));
			else
				point2.x = point1.x + (absdy * (dx > 0? 1 : -1));
		}
		else if (fl.tools.ctlIsDown)
		{
			//changetrapeziumWidth(pt2);
		}
		else if (fl.tools.altIsDown)
		{
			//changetrapeziumOffset(pt2);
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
Fonction qui calcul les points pour le dessin du trapèze avec sa flèche.
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
	
	trapezium.Build(pt1, pt2);

}
/*
*/
function drawtrapeziumObj()
{
	if (thetrapezium[0].length != 0){
		DrawingLayerMoveTo(0,0);
		for (var i=2; i<thetrapezium[0].length; i+=2) {
			DrawingLayerLineTo(0,i);
		}
		return;
	}
}
/*
Fonction dessinant une ligne sur le DrawingLayer.
*/
function DrawingLayerLineTo(index1, index2)
{
	var tmpPt  = new Object();
	var viewMat = fl.getDocumentDOM().viewMatrix;
	tmpPt.x = thetrapezium[index1][index2];
	tmpPt.y = thetrapezium[index1][index2+1];
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
	tmpPt.x = thetrapezium[index1][index2];	
	tmpPt.y = thetrapezium[index1][index2+1];
	transformPoint(tmpPt,  viewMat);
	fl.drawingLayer.moveTo(tmpPt.x,  tmpPt.y);
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






