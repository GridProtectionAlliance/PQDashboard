using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Web;
using GSF.Collections;

/// <summary>
/// Summary description for MarchingSquares, Developed based on the marchingsquares-isobands.js algorithm.
/// </summary>
public class MarchingSquares
{
    public MarchingSquares()
    {
        isoBandNextXTL = new Dictionary<int, int>();
        isoBandNextYTL = new Dictionary<int, int>();
        isoBandNextOTL = new Dictionary<int, int>();
        isoBandNextXTR = new Dictionary<int, int>();
        isoBandNextYTR = new Dictionary<int, int>();
        isoBandNextOTR = new Dictionary<int, int>();
        isoBandNextXRT = new Dictionary<int, int>();
        isoBandNextYRT = new Dictionary<int, int>();
        isoBandNextORT = new Dictionary<int, int>();
        isoBandNextXRB = new Dictionary<int, int>();
        isoBandNextYRB = new Dictionary<int, int>();
        isoBandNextORB = new Dictionary<int, int>();
        isoBandNextXBL = new Dictionary<int, int>();
        isoBandNextYBL = new Dictionary<int, int>();
        isoBandNextOBL = new Dictionary<int, int>();
        isoBandNextXBR = new Dictionary<int, int>();
        isoBandNextYBR = new Dictionary<int, int>();
        isoBandNextOBR = new Dictionary<int, int>();
        isoBandNextXLT = new Dictionary<int, int>();
        isoBandNextYLT = new Dictionary<int, int>();
        isoBandNextOLT = new Dictionary<int, int>();
        isoBandNextXLB = new Dictionary<int, int>();
        isoBandNextYLB = new Dictionary<int, int>();
        isoBandNextOLB = new Dictionary<int, int>();
        isoBandEdgeRT = new Dictionary<int, int>(); 
        isoBandEdgeRB = new Dictionary<int, int>(); 
        isoBandEdgeBR = new Dictionary<int, int>(); 
        isoBandEdgeBL = new Dictionary<int, int>(); 
        isoBandEdgeLB = new Dictionary<int, int>(); 
        isoBandEdgeLT = new Dictionary<int, int>(); 
        isoBandEdgeTL = new Dictionary<int, int>();
        isoBandEdgeTR = new Dictionary<int, int>();
        polygon_table = new Dictionary<int, Func<Cells, object>>(); 
        LoadLookups();

    }

    public class defaultSettings
    {
        public bool verbose;
        public bool polygons;
        public string successCallback;
        public string progressCallback;

        public defaultSettings()
        {
            verbose = false;
            polygons = false;
            successCallback = null;
            progressCallback = null;
        }
    }


    /*
  Thats all for the public interface, below follows the actual
  implementation
*/

    /* Some private private Dictionary<int, int>iables */
    private int Node0 = 64;
    private int Node1 = 16;
    private int Node2 = 4;
    private int Node3 = 1;

    private Dictionary<int, int> isoBandNextXTL;
    private Dictionary<int, int> isoBandNextYTL;
    private Dictionary<int, int> isoBandNextOTL;
    private Dictionary<int, int> isoBandNextXTR;
    private Dictionary<int, int> isoBandNextYTR;
    private Dictionary<int, int> isoBandNextOTR;
    private Dictionary<int, int> isoBandNextXRT;
    private Dictionary<int, int> isoBandNextYRT;
    private Dictionary<int, int> isoBandNextORT;
    private Dictionary<int, int> isoBandNextXRB;
    private Dictionary<int, int> isoBandNextYRB;
    private Dictionary<int, int> isoBandNextORB;
    private Dictionary<int, int> isoBandNextXBL;
    private Dictionary<int, int> isoBandNextYBL;
    private Dictionary<int, int> isoBandNextOBL;
    private Dictionary<int, int> isoBandNextXBR;
    private Dictionary<int, int> isoBandNextYBR;
    private Dictionary<int, int> isoBandNextOBR;
    private Dictionary<int, int> isoBandNextXLT;
    private Dictionary<int, int> isoBandNextYLT;
    private Dictionary<int, int> isoBandNextOLT;
    private Dictionary<int, int> isoBandNextXLB;
    private Dictionary<int, int> isoBandNextYLB;
    private Dictionary<int, int> isoBandNextOLB;
    private Dictionary<int, int> isoBandEdgeRT;
    private Dictionary<int, int> isoBandEdgeRB;
    private Dictionary<int, int> isoBandEdgeBR;
    private Dictionary<int, int> isoBandEdgeBL;
    private Dictionary<int, int> isoBandEdgeLB;
    private Dictionary<int, int> isoBandEdgeLT;
    private Dictionary<int, int> isoBandEdgeTL;
    private Dictionary<int, int> isoBandEdgeTR;

    private Dictionary<int, Func<Cells, object>> polygon_table;

    public class Cells
    {
        public int cval;
        public int cval_real;
        public double flipped;
        public double topleft;
        public double topright;
        public double righttop;
        public double rightbottom;
        public double bottomright;
        public double bottomleft;
        public double leftbottom;
        public double lefttop;
        public List<int> edges;
    }

    public class BandGrid
    {
        public int rows;
        public int cols;
        public Cells[][] cells;

        public BandGrid(int r, int c)
        {
            rows = r;
            cols = c;
            cells = new Cells[r][];
            for (int i = 0; i < r; ++i)
            {
                cells[i] = new Cells[c];
            }
        }
    }

    public class XY
    {
        public double[] p;
        public int x;
        public int y;
        public int o;
        
        public XY(double[] pInts, int xInts, int yInts, int oInts)
        {
            p = new double[2] { pInts[0], pInts[1] };
            x = xInts;
            y = yInts;
            o = oInts;
        }
    }

    public class GridPath
    {
        public List<List<double>> path;
        public int i;
        public int j;
        public int x;
        public int y;
        public int o;
        
        public GridPath(List<List<double>> pathVar, int p, int q, int d_x, int d_y, int d_o)
        {
            path = pathVar;
            i = p;
            j = q;
            x = d_x;
            y = d_y;
            o = d_o;
        }
    }

    private void LoadLookups()
    {
        isoBandNextXRT.Add(85, -1);
        isoBandNextXRB.Add(85, -1);
        isoBandNextYRT.Add(85, 0);
        isoBandNextYRB.Add(85, 0);
        isoBandNextORT.Add(85, 1);
        isoBandNextORB.Add(85, 1);
        isoBandNextXLT.Add(85, 1);
        isoBandNextXLB.Add(85, 1);
        isoBandNextYLT.Add(85, 0);
        isoBandNextYLB.Add(85, 0);
        isoBandNextOLT.Add(85, 1);
        isoBandNextOLB.Add(85, 1);
        isoBandNextXTL.Add(85, 0);
        isoBandNextXTR.Add(85, 0);
        isoBandNextYTL.Add(85, -1);
        isoBandNextYTR.Add(85, -1);
        isoBandNextOTL.Add(85, 0);
        isoBandNextOBL.Add(85, 0);
        isoBandNextXBR.Add(85, 0);
        isoBandNextXBL.Add(85, 0);
        isoBandNextYBR.Add(85, 1);
        isoBandNextYBL.Add(85, 1);
        isoBandNextOTR.Add(85, 1);
        isoBandNextOBR.Add(85, 1);
        isoBandNextXLB.Add(1, 0);
        isoBandNextXLB.Add(169, 0);
        isoBandNextYLB.Add(1, -1);
        isoBandNextYLB.Add(169, -1);
        isoBandNextOLB.Add(1, 0);
        isoBandNextOLB.Add(169, 0);
        isoBandNextXBL.Add(1, -1);
        isoBandNextXBL.Add(169, -1);
        isoBandNextYBL.Add(1, 0);
        isoBandNextYBL.Add(169, 0);
        isoBandNextOBL.Add(1, 0);
        isoBandNextOBL.Add(169, 0);
        isoBandNextXRB.Add(4, 0);
        isoBandNextXRB.Add(166, 0);
        isoBandNextYRB.Add(4, -1);
        isoBandNextYRB.Add(166, -1);
        isoBandNextORB.Add(4, 1);
        isoBandNextORB.Add(166, 1);
        isoBandNextXBR.Add(4, 1);
        isoBandNextXBR.Add(166, 1);
        isoBandNextYBR.Add(4, 0);
        isoBandNextYBR.Add(166, 0);
        isoBandNextOBR.Add(4, 0);
        isoBandNextOBR.Add(166, 0);
        isoBandNextXRT.Add(16, 0);
        isoBandNextXRT.Add(154, 0);
        isoBandNextYRT.Add(16, 1);
        isoBandNextYRT.Add(154, 1);
        isoBandNextORT.Add(16, 1);
        isoBandNextORT.Add(154, 1);
        isoBandNextXTR.Add(16, 1);
        isoBandNextXTR.Add(154, 1);
        isoBandNextYTR.Add(16, 0);
        isoBandNextYTR.Add(154, 0);
        isoBandNextOTR.Add(16, 1);
        isoBandNextOTR.Add(154, 1);
        isoBandNextXLT.Add(64, 0);
        isoBandNextXLT.Add(106, 0);
        isoBandNextYLT.Add(64, 1);
        isoBandNextYLT.Add(106, 1);
        isoBandNextOLT.Add(64, 0);
        isoBandNextOLT.Add(106, 0);
        isoBandNextXTL.Add(64, -1);
        isoBandNextXTL.Add(106, -1);
        isoBandNextYTL.Add(64, 0);
        isoBandNextYTL.Add(106, 0);
        isoBandNextOTL.Add(64, 1);
        isoBandNextOTL.Add(106, 1);
        isoBandNextXLT.Add(2, 0);
        isoBandNextXLT.Add(168, 0);
        isoBandNextYLT.Add(2, -1);
        isoBandNextYLT.Add(168, -1);
        isoBandNextOLT.Add(2, 1);
        isoBandNextOLT.Add(168, 1);
        isoBandNextXLB.Add(2, 0);
        isoBandNextXLB.Add(168, 0);
        isoBandNextYLB.Add(2, -1);
        isoBandNextYLB.Add(168, -1);
        isoBandNextOLB.Add(2, 0);
        isoBandNextOLB.Add(168, 0);
        isoBandNextXBL.Add(2, -1);
        isoBandNextXBL.Add(168, -1);
        isoBandNextYBL.Add(2, 0);
        isoBandNextYBL.Add(168, 0);
        isoBandNextOBL.Add(2, 0);
        isoBandNextOBL.Add(168, 0);
        isoBandNextXBR.Add(2, -1);
        isoBandNextXBR.Add(168, -1);
        isoBandNextYBR.Add(2, 0);
        isoBandNextYBR.Add(168, 0);
        isoBandNextOBR.Add(2, 1);
        isoBandNextOBR.Add(168, 1);
        isoBandNextXRT.Add(8, 0);
        isoBandNextXRT.Add(162, 0);
        isoBandNextYRT.Add(8, -1);
        isoBandNextYRT.Add(162, -1);
        isoBandNextORT.Add(8, 0);
        isoBandNextORT.Add(162, 0);
        isoBandNextXRB.Add(8, 0);
        isoBandNextXRB.Add(162, 0);
        isoBandNextYRB.Add(8, -1);
        isoBandNextYRB.Add(162, -1);
        isoBandNextORB.Add(8, 1);
        isoBandNextORB.Add(162, 1);
        isoBandNextXBL.Add(8, 1);
        isoBandNextXBL.Add(162, 1);
        isoBandNextYBL.Add(8, 0);
        isoBandNextYBL.Add(162, 0);
        isoBandNextOBL.Add(8, 1);
        isoBandNextOBL.Add(162, 1);
        isoBandNextXBR.Add(8, 1);
        isoBandNextXBR.Add(162, 1);
        isoBandNextYBR.Add(8, 0);
        isoBandNextYBR.Add(162, 0);
        isoBandNextOBR.Add(8, 0);
        isoBandNextOBR.Add(162, 0);
        isoBandNextXRT.Add(32, 0);
        isoBandNextXRT.Add(138, 0);
        isoBandNextYRT.Add(32, 1);
        isoBandNextYRT.Add(138, 1);
        isoBandNextORT.Add(32, 1);
        isoBandNextORT.Add(138, 1);
        isoBandNextXRB.Add(32, 0);
        isoBandNextXRB.Add(138, 0);
        isoBandNextYRB.Add(32, 1);
        isoBandNextYRB.Add(138, 1);
        isoBandNextORB.Add(32, 0);
        isoBandNextORB.Add(138, 0);
        isoBandNextXTL.Add(32, 1);
        isoBandNextXTL.Add(138, 1);
        isoBandNextYTL.Add(32, 0);
        isoBandNextYTL.Add(138, 0);
        isoBandNextOTL.Add(32, 0);
        isoBandNextOTL.Add(138, 0);
        isoBandNextXTR.Add(32, 1);
        isoBandNextXTR.Add(138, 1);
        isoBandNextYTR.Add(32, 0);
        isoBandNextYTR.Add(138, 0);
        isoBandNextOTR.Add(32, 1);
        isoBandNextOTR.Add(138, 1);
        isoBandNextXLB.Add(128, 0);
        isoBandNextXLB.Add(42, 0);
        isoBandNextYLB.Add(128, 1);
        isoBandNextYLB.Add(42, 1);
        isoBandNextOLB.Add(128, 1);
        isoBandNextOLB.Add(42, 1);
        isoBandNextXLT.Add(128, 0);
        isoBandNextXLT.Add(42, 0);
        isoBandNextYLT.Add(128, 1);
        isoBandNextYLT.Add(42, 1);
        isoBandNextOLT.Add(128, 0);
        isoBandNextOLT.Add(42, 0);
        isoBandNextXTL.Add(128, -1);
        isoBandNextXTL.Add(42, -1);
        isoBandNextYTL.Add(128, 0);
        isoBandNextYTL.Add(42, 0);
        isoBandNextOTL.Add(128, 1);
        isoBandNextOTL.Add(42, 1);
        isoBandNextXTR.Add(128, -1);
        isoBandNextXTR.Add(42, -1);
        isoBandNextYTR.Add(128, 0);
        isoBandNextYTR.Add(42, 0);
        isoBandNextOTR.Add(128, 0);
        isoBandNextOTR.Add(42, 0);
        isoBandNextXRB.Add(5, -1);
        isoBandNextXRB.Add(165, -1);
        isoBandNextYRB.Add(5, 0);
        isoBandNextYRB.Add(165, 0);
        isoBandNextORB.Add(5, 0);
        isoBandNextORB.Add(165, 0);
        isoBandNextXLB.Add(5, 1);
        isoBandNextXLB.Add(165, 1);
        isoBandNextYLB.Add(5, 0);
        isoBandNextYLB.Add(165, 0);
        isoBandNextOLB.Add(5, 0);
        isoBandNextOLB.Add(165, 0);
        isoBandNextXBR.Add(20, 0);
        isoBandNextXBR.Add(150, 0);
        isoBandNextYBR.Add(20, 1);
        isoBandNextYBR.Add(150, 1);
        isoBandNextOBR.Add(20, 1);
        isoBandNextOBR.Add(150, 1);
        isoBandNextXTR.Add(20, 0);
        isoBandNextXTR.Add(150, 0);
        isoBandNextYTR.Add(20, -1);
        isoBandNextYTR.Add(150, -1);
        isoBandNextOTR.Add(20, 1);
        isoBandNextOTR.Add(150, 1);
        isoBandNextXRT.Add(80, -1);
        isoBandNextXRT.Add(90, -1);
        isoBandNextYRT.Add(80, 0);
        isoBandNextYRT.Add(90, 0);
        isoBandNextORT.Add(80, 1);
        isoBandNextORT.Add(90, 1);
        isoBandNextXLT.Add(80, 1);
        isoBandNextXLT.Add(90, 1);
        isoBandNextYLT.Add(80, 0);
        isoBandNextYLT.Add(90, 0);
        isoBandNextOLT.Add(80, 1);
        isoBandNextOLT.Add(90, 1);
        isoBandNextXBL.Add(65, 0);
        isoBandNextXBL.Add(105, 0);
        isoBandNextYBL.Add(65, 1);
        isoBandNextYBL.Add(105, 1);
        isoBandNextOBL.Add(65, 0);
        isoBandNextOBL.Add(105, 0);
        isoBandNextXTL.Add(65, 0);
        isoBandNextXTL.Add(105, 0);
        isoBandNextYTL.Add(65, -1);
        isoBandNextYTL.Add(105, -1);
        isoBandNextOTL.Add(65, 0);
        isoBandNextOTL.Add(105, 0);
        isoBandNextXRT.Add(160, -1);
        isoBandNextXRT.Add(10, -1);
        isoBandNextYRT.Add(160, 0);
        isoBandNextYRT.Add(10, 0);
        isoBandNextORT.Add(160, 1);
        isoBandNextORT.Add(10, 1);
        isoBandNextXRB.Add(160, -1);
        isoBandNextXRB.Add(10, -1);
        isoBandNextYRB.Add(160, 0);
        isoBandNextYRB.Add(10, 0);
        isoBandNextORB.Add(160, 0);
        isoBandNextORB.Add(10, 0);
        isoBandNextXLB.Add(160, 1);
        isoBandNextXLB.Add(10, 1);
        isoBandNextYLB.Add(160, 0);
        isoBandNextYLB.Add(10, 0);
        isoBandNextOLB.Add(160, 0);
        isoBandNextOLB.Add(10, 0);
        isoBandNextXLT.Add(160, 1);
        isoBandNextXLT.Add(10, 1);
        isoBandNextYLT.Add(160, 0);
        isoBandNextYLT.Add(10, 0);
        isoBandNextOLT.Add(160, 1);
        isoBandNextOLT.Add(10, 1);
        isoBandNextXBR.Add(130, 0);
        isoBandNextXBR.Add(40, 0);
        isoBandNextYBR.Add(130, 1);
        isoBandNextYBR.Add(40, 1);
        isoBandNextOBR.Add(130, 1);
        isoBandNextOBR.Add(40, 1);
        isoBandNextXBL.Add(130, 0);
        isoBandNextXBL.Add(40, 0);
        isoBandNextYBL.Add(130, 1);
        isoBandNextYBL.Add(40, 1);
        isoBandNextOBL.Add(130, 0);
        isoBandNextOBL.Add(40, 0);
        isoBandNextXTL.Add(130, 0);
        isoBandNextXTL.Add(40, 0);
        isoBandNextYTL.Add(130, -1);
        isoBandNextYTL.Add(40, -1);
        isoBandNextOTL.Add(130, 0);
        isoBandNextOTL.Add(40, 0);
        isoBandNextXTR.Add(130, 0);
        isoBandNextXTR.Add(40, 0);
        isoBandNextYTR.Add(130, -1);
        isoBandNextYTR.Add(40, -1);
        isoBandNextOTR.Add(130, 1);
        isoBandNextOTR.Add(40, 1);
        isoBandNextXRB.Add(37, 0);
        isoBandNextXRB.Add(133, 0);
        isoBandNextYRB.Add(37, 1);
        isoBandNextYRB.Add(133, 1);
        isoBandNextORB.Add(37, 1);
        isoBandNextORB.Add(133, 1);
        isoBandNextXLB.Add(37, 0);
        isoBandNextXLB.Add(133, 0);
        isoBandNextYLB.Add(37, 1);
        isoBandNextYLB.Add(133, 1);
        isoBandNextOLB.Add(37, 0);
        isoBandNextOLB.Add(133, 0);
        isoBandNextXTL.Add(37, -1);
        isoBandNextXTL.Add(133, -1);
        isoBandNextYTL.Add(37, 0);
        isoBandNextYTL.Add(133, 0);
        isoBandNextOTL.Add(37, 0);
        isoBandNextOTL.Add(133, 0);
        isoBandNextXTR.Add(37, 1);
        isoBandNextXTR.Add(133, 1);
        isoBandNextYTR.Add(37, 0);
        isoBandNextYTR.Add(133, 0);
        isoBandNextOTR.Add(37, 0);
        isoBandNextOTR.Add(133, 0);
        isoBandNextXBR.Add(148, -1);
        isoBandNextXBR.Add(22, -1);
        isoBandNextYBR.Add(148, 0);
        isoBandNextYBR.Add(22, 0);
        isoBandNextOBR.Add(148, 0);
        isoBandNextOBR.Add(22, 0);
        isoBandNextXLB.Add(148, 0);
        isoBandNextXLB.Add(22, 0);
        isoBandNextYLB.Add(148, -1);
        isoBandNextYLB.Add(22, -1);
        isoBandNextOLB.Add(148, 1);
        isoBandNextOLB.Add(22, 1);
        isoBandNextXLT.Add(148, 0);
        isoBandNextXLT.Add(22, 0);
        isoBandNextYLT.Add(148, 1);
        isoBandNextYLT.Add(22, 1);
        isoBandNextOLT.Add(148, 1);
        isoBandNextOLT.Add(22, 1);
        isoBandNextXTR.Add(148, -1);
        isoBandNextXTR.Add(22, -1);
        isoBandNextYTR.Add(148, 0);
        isoBandNextYTR.Add(22, 0);
        isoBandNextOTR.Add(148, 1);
        isoBandNextOTR.Add(22, 1);
        isoBandNextXRT.Add(82, 0);
        isoBandNextXRT.Add(88, 0);
        isoBandNextYRT.Add(82, -1);
        isoBandNextYRT.Add(88, -1);
        isoBandNextORT.Add(82, 1);
        isoBandNextORT.Add(88, 1);
        isoBandNextXBR.Add(82, 1);
        isoBandNextXBR.Add(88, 1);
        isoBandNextYBR.Add(82, 0);
        isoBandNextYBR.Add(88, 0);
        isoBandNextOBR.Add(82, 1);
        isoBandNextOBR.Add(88, 1);
        isoBandNextXBL.Add(82, -1);
        isoBandNextXBL.Add(88, -1);
        isoBandNextYBL.Add(82, 0);
        isoBandNextYBL.Add(88, 0);
        isoBandNextOBL.Add(82, 1);
        isoBandNextOBL.Add(88, 1);
        isoBandNextXLT.Add(82, 0);
        isoBandNextXLT.Add(88, 0);
        isoBandNextYLT.Add(82, -1);
        isoBandNextYLT.Add(88, -1);
        isoBandNextOLT.Add(82, 0);
        isoBandNextOLT.Add(88, 0);
        isoBandNextXRT.Add(73, 0);
        isoBandNextXRT.Add(97, 0);
        isoBandNextYRT.Add(73, 1);
        isoBandNextYRT.Add(97, 1);
        isoBandNextORT.Add(73, 0);
        isoBandNextORT.Add(97, 0);
        isoBandNextXRB.Add(73, 0);
        isoBandNextXRB.Add(97, 0);
        isoBandNextYRB.Add(73, -1);
        isoBandNextYRB.Add(97, -1);
        isoBandNextORB.Add(73, 0);
        isoBandNextORB.Add(97, 0);
        isoBandNextXBL.Add(73, 1);
        isoBandNextXBL.Add(97, 1);
        isoBandNextYBL.Add(73, 0);
        isoBandNextYBL.Add(97, 0);
        isoBandNextOBL.Add(73, 0);
        isoBandNextOBL.Add(97, 0);
        isoBandNextXTL.Add(73, 1);
        isoBandNextXTL.Add(97, 1);
        isoBandNextYTL.Add(73, 0);
        isoBandNextYTL.Add(97, 0);
        isoBandNextOTL.Add(73, 1);
        isoBandNextOTL.Add(97, 1);
        isoBandNextXRT.Add(145, 0);
        isoBandNextXRT.Add(25, 0);
        isoBandNextYRT.Add(145, 1);
        isoBandNextYRT.Add(25, -1);
        isoBandNextORT.Add(145, 0);
        isoBandNextORT.Add(25, 0);
        isoBandNextXBL.Add(145, 1);
        isoBandNextXBL.Add(25, 1);
        isoBandNextYBL.Add(145, 0);
        isoBandNextYBL.Add(25, 0);
        isoBandNextOBL.Add(145, 1);
        isoBandNextOBL.Add(25, 1);
        isoBandNextXLB.Add(145, 0);
        isoBandNextXLB.Add(25, 0);
        isoBandNextYLB.Add(145, 1);
        isoBandNextYLB.Add(25, 1);
        isoBandNextOLB.Add(145, 1);
        isoBandNextOLB.Add(25, 1);
        isoBandNextXTR.Add(145, -1);
        isoBandNextXTR.Add(25, -1);
        isoBandNextYTR.Add(145, 0);
        isoBandNextYTR.Add(25, 0);
        isoBandNextOTR.Add(145, 0);
        isoBandNextOTR.Add(25, 0);
        isoBandNextXRB.Add(70, 0);
        isoBandNextXRB.Add(100, 0);
        isoBandNextYRB.Add(70, 1);
        isoBandNextYRB.Add(100, 1);
        isoBandNextORB.Add(70, 0);
        isoBandNextORB.Add(100, 0);
        isoBandNextXBR.Add(70, -1);
        isoBandNextXBR.Add(100, -1);
        isoBandNextYBR.Add(70, 0);
        isoBandNextYBR.Add(100, 0);
        isoBandNextOBR.Add(70, 1);
        isoBandNextOBR.Add(100, 1);
        isoBandNextXLT.Add(70, 0);
        isoBandNextXLT.Add(100, 0);
        isoBandNextYLT.Add(70, -1);
        isoBandNextYLT.Add(100, -1);
        isoBandNextOLT.Add(70, 1);
        isoBandNextOLT.Add(100, 1);
        isoBandNextXTL.Add(70, 1);
        isoBandNextXTL.Add(100, 1);
        isoBandNextYTL.Add(70, 0);
        isoBandNextYTL.Add(100, 0);
        isoBandNextOTL.Add(70, 0);
        isoBandNextOTL.Add(100, 0);
        isoBandNextXRB.Add(101, 0);
        isoBandNextXRB.Add(69, 0);
        isoBandNextYRB.Add(101, 1);
        isoBandNextYRB.Add(69, 1);
        isoBandNextORB.Add(101, 0);
        isoBandNextORB.Add(69, 0);
        isoBandNextXTL.Add(101, 1);
        isoBandNextXTL.Add(69, 1);
        isoBandNextYTL.Add(101, 0);
        isoBandNextYTL.Add(69, 0);
        isoBandNextOTL.Add(101, 0);
        isoBandNextOTL.Add(69, 0);
        isoBandNextXLB.Add(149, 0);
        isoBandNextXLB.Add(21, 0);
        isoBandNextYLB.Add(149, 1);
        isoBandNextYLB.Add(21, 1);
        isoBandNextOLB.Add(149, 1);
        isoBandNextOLB.Add(21, 1);
        isoBandNextXTR.Add(149, -1);
        isoBandNextXTR.Add(21, -1);
        isoBandNextYTR.Add(149, 0);
        isoBandNextYTR.Add(21, 0);
        isoBandNextOTR.Add(149, 0);
        isoBandNextOTR.Add(21, 0);
        isoBandNextXBR.Add(86, -1);
        isoBandNextXBR.Add(84, -1);
        isoBandNextYBR.Add(86, 0);
        isoBandNextYBR.Add(84, 0);
        isoBandNextOBR.Add(86, 1);
        isoBandNextOBR.Add(84, 1);
        isoBandNextXLT.Add(86, 0);
        isoBandNextXLT.Add(84, 0);
        isoBandNextYLT.Add(86, -1);
        isoBandNextYLT.Add(84, -1);
        isoBandNextOLT.Add(86, 1);
        isoBandNextOLT.Add(84, 1);
        isoBandNextXRT.Add(89, 0);
        isoBandNextXRT.Add(81, 0);
        isoBandNextYRT.Add(89, -1);
        isoBandNextYRT.Add(81, -1);
        isoBandNextORT.Add(89, 0);
        isoBandNextORT.Add(81, 0);
        isoBandNextXBL.Add(89, 1);
        isoBandNextXBL.Add(81, 1);
        isoBandNextYBL.Add(89, 0);
        isoBandNextYBL.Add(81, 0);
        isoBandNextOBL.Add(89, 1);
        isoBandNextOBL.Add(81, 1);
        isoBandNextXRT.Add(96, 0);
        isoBandNextXRT.Add(74, 0);
        isoBandNextYRT.Add(96, 1);
        isoBandNextYRT.Add(74, 1);
        isoBandNextORT.Add(96, 0);
        isoBandNextORT.Add(74, 0);
        isoBandNextXRB.Add(96, -1);
        isoBandNextXRB.Add(74, -1);
        isoBandNextYRB.Add(96, 0);
        isoBandNextYRB.Add(74, 0);
        isoBandNextORB.Add(96, 1);
        isoBandNextORB.Add(74, 1);
        isoBandNextXLT.Add(96, 1);
        isoBandNextXLT.Add(74, 1);
        isoBandNextYLT.Add(96, 0);
        isoBandNextYLT.Add(74, 0);
        isoBandNextOLT.Add(96, 0);
        isoBandNextOLT.Add(74, 0);
        isoBandNextXTL.Add(96, 1);
        isoBandNextXTL.Add(74, 1);
        isoBandNextYTL.Add(96, 0);
        isoBandNextYTL.Add(74, 0);
        isoBandNextOTL.Add(96, 1);
        isoBandNextOTL.Add(74, 1);
        isoBandNextXRT.Add(24, 0);
        isoBandNextXRT.Add(146, 0);
        isoBandNextYRT.Add(24, -1);
        isoBandNextYRT.Add(146, -1);
        isoBandNextORT.Add(24, 1);
        isoBandNextORT.Add(146, 1);
        isoBandNextXBR.Add(24, 1);
        isoBandNextXBR.Add(146, 1);
        isoBandNextYBR.Add(24, 0);
        isoBandNextYBR.Add(146, 0);
        isoBandNextOBR.Add(24, 1);
        isoBandNextOBR.Add(146, 1);
        isoBandNextXBL.Add(24, 0);
        isoBandNextXBL.Add(146, 0);
        isoBandNextYBL.Add(24, 1);
        isoBandNextYBL.Add(146, 1);
        isoBandNextOBL.Add(24, 1);
        isoBandNextOBL.Add(146, 1);
        isoBandNextXTR.Add(24, 0);
        isoBandNextXTR.Add(146, 0);
        isoBandNextYTR.Add(24, -1);
        isoBandNextYTR.Add(146, -1);
        isoBandNextOTR.Add(24, 0);
        isoBandNextOTR.Add(146, 0);
        isoBandNextXRB.Add(6, -1);
        isoBandNextXRB.Add(164, -1);
        isoBandNextYRB.Add(6, 0);
        isoBandNextYRB.Add(164, 0);
        isoBandNextORB.Add(6, 1);
        isoBandNextORB.Add(164, 1);
        isoBandNextXBR.Add(6, -1);
        isoBandNextXBR.Add(164, -1);
        isoBandNextYBR.Add(6, 0);
        isoBandNextYBR.Add(164, 0);
        isoBandNextOBR.Add(6, 0);
        isoBandNextOBR.Add(164, 0);
        isoBandNextXLB.Add(6, 0);
        isoBandNextXLB.Add(164, 0);
        isoBandNextYLB.Add(6, -1);
        isoBandNextYLB.Add(164, -1);
        isoBandNextOLB.Add(6, 1);
        isoBandNextOLB.Add(164, 1);
        isoBandNextXLT.Add(6, 1);
        isoBandNextXLT.Add(164, 1);
        isoBandNextYLT.Add(6, 0);
        isoBandNextYLT.Add(164, 0);
        isoBandNextOLT.Add(6, 0);
        isoBandNextOLT.Add(164, 0);
        isoBandNextXBL.Add(129, 0);
        isoBandNextXBL.Add(41, 0);
        isoBandNextYBL.Add(129, 1);
        isoBandNextYBL.Add(41, 1);
        isoBandNextOBL.Add(129, 1);
        isoBandNextOBL.Add(41, 1);
        isoBandNextXLB.Add(129, 0);
        isoBandNextXLB.Add(41, 0);
        isoBandNextYLB.Add(129, 1);
        isoBandNextYLB.Add(41, 1);
        isoBandNextOLB.Add(129, 0);
        isoBandNextOLB.Add(41, 0);
        isoBandNextXTL.Add(129, -1);
        isoBandNextXTL.Add(41, -1);
        isoBandNextYTL.Add(129, 0);
        isoBandNextYTL.Add(41, 0);
        isoBandNextOTL.Add(129, 0);
        isoBandNextOTL.Add(41, 0);
        isoBandNextXTR.Add(129, 0);
        isoBandNextXTR.Add(41, 0);
        isoBandNextYTR.Add(129, -1);
        isoBandNextYTR.Add(41, -1);
        isoBandNextOTR.Add(129, 0);
        isoBandNextOTR.Add(41, 0);
        isoBandNextXBR.Add(66, 0);
        isoBandNextXBR.Add(104, 0);
        isoBandNextYBR.Add(66, 1);
        isoBandNextYBR.Add(104, 1);
        isoBandNextOBR.Add(66, 0);
        isoBandNextOBR.Add(104, 0);
        isoBandNextXBL.Add(66, -1);
        isoBandNextXBL.Add(104, -1);
        isoBandNextYBL.Add(66, 0);
        isoBandNextYBL.Add(104, 0);
        isoBandNextOBL.Add(66, 1);
        isoBandNextOBL.Add(104, 1);
        isoBandNextXLT.Add(66, 0);
        isoBandNextXLT.Add(104, 0);
        isoBandNextYLT.Add(66, -1);
        isoBandNextYLT.Add(104, -1);
        isoBandNextOLT.Add(66, 0);
        isoBandNextOLT.Add(104, 0);
        isoBandNextXTL.Add(66, 0);
        isoBandNextXTL.Add(104, 0);
        isoBandNextYTL.Add(66, -1);
        isoBandNextYTL.Add(104, -1);
        isoBandNextOTL.Add(66, 1);
        isoBandNextOTL.Add(104, 1);
        isoBandNextXRT.Add(144, -1);
        isoBandNextXRT.Add(26, -1);
        isoBandNextYRT.Add(144, 0);
        isoBandNextYRT.Add(26, 0);
        isoBandNextORT.Add(144, 0);
        isoBandNextORT.Add(26, 0);
        isoBandNextXLB.Add(144, 1);
        isoBandNextXLB.Add(26, 1);
        isoBandNextYLB.Add(144, 0);
        isoBandNextYLB.Add(26, 0);
        isoBandNextOLB.Add(144, 1);
        isoBandNextOLB.Add(26, 1);
        isoBandNextXLT.Add(144, 0);
        isoBandNextXLT.Add(26, 0);
        isoBandNextYLT.Add(144, 1);
        isoBandNextYLT.Add(26, 1);
        isoBandNextOLT.Add(144, 1);
        isoBandNextOLT.Add(26, 1);
        isoBandNextXTR.Add(144, -1);
        isoBandNextXTR.Add(26, -1);
        isoBandNextYTR.Add(144, 0);
        isoBandNextYTR.Add(26, 0);
        isoBandNextOTR.Add(144, 1);
        isoBandNextOTR.Add(26, 1);
        isoBandNextXRB.Add(36, 0);
        isoBandNextXRB.Add(134, 0);
        isoBandNextYRB.Add(36, 1);
        isoBandNextYRB.Add(134, 1);
        isoBandNextORB.Add(36, 1);
        isoBandNextORB.Add(134, 1);
        isoBandNextXBR.Add(36, 0);
        isoBandNextXBR.Add(134, 0);
        isoBandNextYBR.Add(36, 1);
        isoBandNextYBR.Add(134, 1);
        isoBandNextOBR.Add(36, 0);
        isoBandNextOBR.Add(134, 0);
        isoBandNextXTL.Add(36, 0);
        isoBandNextXTL.Add(134, 0);
        isoBandNextYTL.Add(36, 1);
        isoBandNextYTL.Add(134, -1);
        isoBandNextOTL.Add(36, 1);
        isoBandNextOTL.Add(134, 1);
        isoBandNextXTR.Add(36, 1);
        isoBandNextXTR.Add(134, 1);
        isoBandNextYTR.Add(36, 0);
        isoBandNextYTR.Add(134, 0);
        isoBandNextOTR.Add(36, 0);
        isoBandNextOTR.Add(134, 0);
        isoBandNextXRT.Add(9, -1);
        isoBandNextXRT.Add(161, -1);
        isoBandNextYRT.Add(9, 0);
        isoBandNextYRT.Add(161, 0);
        isoBandNextORT.Add(9, 0);
        isoBandNextORT.Add(161, 0);
        isoBandNextXRB.Add(9, 0);
        isoBandNextXRB.Add(161, 0);
        isoBandNextYRB.Add(9, -1);
        isoBandNextYRB.Add(161, -1);
        isoBandNextORB.Add(9, 0);
        isoBandNextORB.Add(161, 0);
        isoBandNextXBL.Add(9, 1);
        isoBandNextXBL.Add(161, 1);
        isoBandNextYBL.Add(9, 0);
        isoBandNextYBL.Add(161, 0);
        isoBandNextOBL.Add(9, 0);
        isoBandNextOBL.Add(161, 0);
        isoBandNextXLB.Add(9, 1);
        isoBandNextXLB.Add(161, 1);
        isoBandNextYLB.Add(9, 0);
        isoBandNextYLB.Add(161, 0);
        isoBandNextOLB.Add(9, 1);
        isoBandNextOLB.Add(161, 1);
        /* 8-sided cases */
        isoBandNextXRT.Add(136, 0);
        isoBandNextYRT.Add(136, 1);
        isoBandNextORT.Add(136, 1);
        isoBandNextXRB.Add(136, 0);
        isoBandNextYRB.Add(136, 1);
        isoBandNextORB.Add(136, 0);
        isoBandNextXBR.Add(136, -1);
        isoBandNextYBR.Add(136, 0);
        isoBandNextOBR.Add(136, 1);
        isoBandNextXBL.Add(136, -1);
        isoBandNextYBL.Add(136, 0);
        isoBandNextOBL.Add(136, 0);
        isoBandNextXLB.Add(136, 0);
        isoBandNextYLB.Add(136, -1);
        isoBandNextOLB.Add(136, 0);
        isoBandNextXLT.Add(136, 0);
        isoBandNextYLT.Add(136, -1);
        isoBandNextOLT.Add(136, 1);
        isoBandNextXTL.Add(136, 1);
        isoBandNextYTL.Add(136, 0);
        isoBandNextOTL.Add(136, 0);
        isoBandNextXTR.Add(136, 1);
        isoBandNextYTR.Add(136, 0);
        isoBandNextOTR.Add(136, 1);
        isoBandNextXRT.Add(34, 0);
        isoBandNextYRT.Add(34, -1);
        isoBandNextORT.Add(34, 0);
        isoBandNextXRB.Add(34, 0);
        isoBandNextYRB.Add(34, -1);
        isoBandNextORB.Add(34, 1);
        isoBandNextXBR.Add(34, 1);
        isoBandNextYBR.Add(34, 0);
        isoBandNextOBR.Add(34, 0);
        isoBandNextXBL.Add(34, 1);
        isoBandNextYBL.Add(34, 0);
        isoBandNextOBL.Add(34, 1);
        isoBandNextXLB.Add(34, 0);
        isoBandNextYLB.Add(34, 1);
        isoBandNextOLB.Add(34, 1);
        isoBandNextXLT.Add(34, 0);
        isoBandNextYLT.Add(34, 1);
        isoBandNextOLT.Add(34, 0);
        isoBandNextXTL.Add(34, -1);
        isoBandNextYTL.Add(34, 0);
        isoBandNextOTL.Add(34, 1);
        isoBandNextXTR.Add(34, -1);
        isoBandNextYTR.Add(34, 0);
        isoBandNextOTR.Add(34, 0);
        isoBandNextXRT.Add(35, 0);
        isoBandNextYRT.Add(35, 1);
        isoBandNextORT.Add(35, 1);
        isoBandNextXRB.Add(35, 0);
        isoBandNextYRB.Add(35, -1);
        isoBandNextORB.Add(35, 1);
        isoBandNextXBR.Add(35, 1);
        isoBandNextYBR.Add(35, 0);
        isoBandNextOBR.Add(35, 0);
        isoBandNextXBL.Add(35, -1);
        isoBandNextYBL.Add(35, 0);
        isoBandNextOBL.Add(35, 0);
        isoBandNextXLB.Add(35, 0);
        isoBandNextYLB.Add(35, -1);
        isoBandNextOLB.Add(35, 0);
        isoBandNextXLT.Add(35, 0);
        isoBandNextYLT.Add(35, 1);
        isoBandNextOLT.Add(35, 0);
        isoBandNextXTL.Add(35, -1);
        isoBandNextYTL.Add(35, 0);
        isoBandNextOTL.Add(35, 1);
        isoBandNextXTR.Add(35, 1);
        isoBandNextYTR.Add(35, 0);
        isoBandNextOTR.Add(35, 1);
        isoBandNextXRT.Add(153, 0);
        isoBandNextYRT.Add(153, 1);
        isoBandNextORT.Add(153, 1);
        isoBandNextXBL.Add(153, -1);
        isoBandNextYBL.Add(153, 0);
        isoBandNextOBL.Add(153, 0);
        isoBandNextXLB.Add(153, 0);
        isoBandNextYLB.Add(153, -1);
        isoBandNextOLB.Add(153, 0);
        isoBandNextXTR.Add(153, 1);
        isoBandNextYTR.Add(153, 0);
        isoBandNextOTR.Add(153, 1);
        isoBandNextXRB.Add(102, 0);
        isoBandNextYRB.Add(102, -1);
        isoBandNextORB.Add(102, 1);
        isoBandNextXBR.Add(102, 1);
        isoBandNextYBR.Add(102, 0);
        isoBandNextOBR.Add(102, 0);
        isoBandNextXLT.Add(102, 0);
        isoBandNextYLT.Add(102, 1);
        isoBandNextOLT.Add(102, 0);
        isoBandNextXTL.Add(102, -1);
        isoBandNextYTL.Add(102, 0);
        isoBandNextOTL.Add(102, 1);
        isoBandNextXRT.Add(155, 0);
        isoBandNextYRT.Add(155, -1);
        isoBandNextORT.Add(155, 0);
        isoBandNextXBL.Add(155, 1);
        isoBandNextYBL.Add(155, 0);
        isoBandNextOBL.Add(155, 1);
        isoBandNextXLB.Add(155, 0);
        isoBandNextYLB.Add(155, 1);
        isoBandNextOLB.Add(155, 1);
        isoBandNextXTR.Add(155, -1);
        isoBandNextYTR.Add(155, 0);
        isoBandNextOTR.Add(155, 0);
        isoBandNextXRB.Add(103, 0);
        isoBandNextYRB.Add(103, 1);
        isoBandNextORB.Add(103, 0);
        isoBandNextXBR.Add(103, -1);
        isoBandNextYBR.Add(103, 0);
        isoBandNextOBR.Add(103, 1);
        isoBandNextXLT.Add(103, 0);
        isoBandNextYLT.Add(103, -1);
        isoBandNextOLT.Add(103, 1);
        isoBandNextXTL.Add(103, 1);
        isoBandNextYTL.Add(103, 0);
        isoBandNextOTL.Add(103, 0);
        isoBandNextXRT.Add(152, 0);
        isoBandNextYRT.Add(152, 1);
        isoBandNextORT.Add(152, 1);
        isoBandNextXBR.Add(152, -1);
        isoBandNextYBR.Add(152, 0);
        isoBandNextOBR.Add(152, 1);
        isoBandNextXBL.Add(152, -1);
        isoBandNextYBL.Add(152, 0);
        isoBandNextOBL.Add(152, 0);
        isoBandNextXLB.Add(152, 0);
        isoBandNextYLB.Add(152, -1);
        isoBandNextOLB.Add(152, 0);
        isoBandNextXLT.Add(152, 0);
        isoBandNextYLT.Add(152, -1);
        isoBandNextOLT.Add(152, 1);
        isoBandNextXTR.Add(152, 1);
        isoBandNextYTR.Add(152, 0);
        isoBandNextOTR.Add(152, 1);
        isoBandNextXRT.Add(156, 0);
        isoBandNextYRT.Add(156, -1);
        isoBandNextORT.Add(156, 1);
        isoBandNextXBR.Add(156, 1);
        isoBandNextYBR.Add(156, 0);
        isoBandNextOBR.Add(156, 1);
        isoBandNextXBL.Add(156, -1);
        isoBandNextYBL.Add(156, 0);
        isoBandNextOBL.Add(156, 0);
        isoBandNextXLB.Add(156, 0);
        isoBandNextYLB.Add(156, -1);
        isoBandNextOLB.Add(156, 0);
        isoBandNextXLT.Add(156, 0);
        isoBandNextYLT.Add(156, 1);
        isoBandNextOLT.Add(156, 1);
        isoBandNextXTR.Add(156, -1);
        isoBandNextYTR.Add(156, 0);
        isoBandNextOTR.Add(156, 1);
        isoBandNextXRT.Add(137, 0);
        isoBandNextYRT.Add(137, 1);
        isoBandNextORT.Add(137, 1);
        isoBandNextXRB.Add(137, 0);
        isoBandNextYRB.Add(137, 1);
        isoBandNextORB.Add(137, 0);
        isoBandNextXBL.Add(137, -1);
        isoBandNextYBL.Add(137, 0);
        isoBandNextOBL.Add(137, 0);
        isoBandNextXLB.Add(137, 0);
        isoBandNextYLB.Add(137, -1);
        isoBandNextOLB.Add(137, 0);
        isoBandNextXTL.Add(137, 1);
        isoBandNextYTL.Add(137, 0);
        isoBandNextOTL.Add(137, 0);
        isoBandNextXTR.Add(137, 1);
        isoBandNextYTR.Add(137, 0);
        isoBandNextOTR.Add(137, 1);
        isoBandNextXRT.Add(139, 0);
        isoBandNextYRT.Add(139, 1);
        isoBandNextORT.Add(139, 1);
        isoBandNextXRB.Add(139, 0);
        isoBandNextYRB.Add(139, -1);
        isoBandNextORB.Add(139, 0);
        isoBandNextXBL.Add(139, 1);
        isoBandNextYBL.Add(139, 0);
        isoBandNextOBL.Add(139, 0);
        isoBandNextXLB.Add(139, 0);
        isoBandNextYLB.Add(139, 1);
        isoBandNextOLB.Add(139, 0);
        isoBandNextXTL.Add(139, -1);
        isoBandNextYTL.Add(139, 0);
        isoBandNextOTL.Add(139, 0);
        isoBandNextXTR.Add(139, 1);
        isoBandNextYTR.Add(139, 0);
        isoBandNextOTR.Add(139, 1);
        isoBandNextXRT.Add(98, 0);
        isoBandNextYRT.Add(98, -1);
        isoBandNextORT.Add(98, 0);
        isoBandNextXRB.Add(98, 0);
        isoBandNextYRB.Add(98, -1);
        isoBandNextORB.Add(98, 1);
        isoBandNextXBR.Add(98, 1);
        isoBandNextYBR.Add(98, 0);
        isoBandNextOBR.Add(98, 0);
        isoBandNextXBL.Add(98, 1);
        isoBandNextYBL.Add(98, 0);
        isoBandNextOBL.Add(98, 1);
        isoBandNextXLT.Add(98, 0);
        isoBandNextYLT.Add(98, 1);
        isoBandNextOLT.Add(98, 0);
        isoBandNextXTL.Add(98, -1);
        isoBandNextYTL.Add(98, 0);
        isoBandNextOTL.Add(98, 1);
        isoBandNextXRT.Add(99, 0);
        isoBandNextYRT.Add(99, 1);
        isoBandNextORT.Add(99, 0);
        isoBandNextXRB.Add(99, 0);
        isoBandNextYRB.Add(99, -1);
        isoBandNextORB.Add(99, 1);
        isoBandNextXBR.Add(99, 1);
        isoBandNextYBR.Add(99, 0);
        isoBandNextOBR.Add(99, 0);
        isoBandNextXBL.Add(99, -1);
        isoBandNextYBL.Add(99, 0);
        isoBandNextOBL.Add(99, 1);
        isoBandNextXLT.Add(99, 0);
        isoBandNextYLT.Add(99, -1);
        isoBandNextOLT.Add(99, 0);
        isoBandNextXTL.Add(99, 1);
        isoBandNextYTL.Add(99, 0);
        isoBandNextOTL.Add(99, 1);
        isoBandNextXRB.Add(38, 0);
        isoBandNextYRB.Add(38, -1);
        isoBandNextORB.Add(38, 1);
        isoBandNextXBR.Add(38, 1);
        isoBandNextYBR.Add(38, 0);
        isoBandNextOBR.Add(38, 0);
        isoBandNextXLB.Add(38, 0);
        isoBandNextYLB.Add(38, 1);
        isoBandNextOLB.Add(38, 1);
        isoBandNextXLT.Add(38, 0);
        isoBandNextYLT.Add(38, 1);
        isoBandNextOLT.Add(38, 0);
        isoBandNextXTL.Add(38, -1);
        isoBandNextYTL.Add(38, 0);
        isoBandNextOTL.Add(38, 1);
        isoBandNextXTR.Add(38, -1);
        isoBandNextYTR.Add(38, 0);
        isoBandNextOTR.Add(38, 0);
        isoBandNextXRB.Add(39, 0);
        isoBandNextYRB.Add(39, 1);
        isoBandNextORB.Add(39, 1);
        isoBandNextXBR.Add(39, -1);
        isoBandNextYBR.Add(39, 0);
        isoBandNextOBR.Add(39, 0);
        isoBandNextXLB.Add(39, 0);
        isoBandNextYLB.Add(39, -1);
        isoBandNextOLB.Add(39, 1);
        isoBandNextXLT.Add(39, 0);
        isoBandNextYLT.Add(39, 1);
        isoBandNextOLT.Add(39, 0);
        isoBandNextXTL.Add(39, -1);
        isoBandNextYTL.Add(39, 0);
        isoBandNextOTL.Add(39, 1);
        isoBandNextXTR.Add(39, 1);
        isoBandNextYTR.Add(39, 0);
        isoBandNextOTR.Add(39, 0);

        /* triangle cases */
        isoBandEdgeBL.Add(1, 18);
        isoBandEdgeLB.Add(1, 18);
        isoBandEdgeBL.Add(169, 18);
        isoBandEdgeLB.Add(169, 18);
        isoBandEdgeBR.Add(4, 12);
        isoBandEdgeRB.Add(4, 12);
        isoBandEdgeBR.Add(166, 12);
        isoBandEdgeRB.Add(166, 12);
        isoBandEdgeRT.Add(16, 4);
        isoBandEdgeTR.Add(16, 4);
        isoBandEdgeRT.Add(154, 4);
        isoBandEdgeTR.Add(154, 4);
        isoBandEdgeLT.Add(64, 22);
        isoBandEdgeTL.Add(64, 22);
        isoBandEdgeLT.Add(106, 22);
        isoBandEdgeTL.Add(106, 22);
        isoBandEdgeBR.Add(2, 17);
        isoBandEdgeLT.Add(2, 17);
        isoBandEdgeBL.Add(2, 18);
        isoBandEdgeLB.Add(2, 18);
        isoBandEdgeBR.Add(168, 17);
        isoBandEdgeLT.Add(168, 17);
        isoBandEdgeBL.Add(168, 18);
        isoBandEdgeLB.Add(168, 18);
        isoBandEdgeRT.Add(8, 9);
        isoBandEdgeBL.Add(8, 9);
        isoBandEdgeRB.Add(8, 12);
        isoBandEdgeBR.Add(8, 12);
        isoBandEdgeRT.Add(162, 9);
        isoBandEdgeBL.Add(162, 9);
        isoBandEdgeRB.Add(162, 12);
        isoBandEdgeBR.Add(162, 12);
        isoBandEdgeRT.Add(32, 4);
        isoBandEdgeTR.Add(32, 4);
        isoBandEdgeRB.Add(32, 1);
        isoBandEdgeTL.Add(32, 1);
        isoBandEdgeRT.Add(138, 4);
        isoBandEdgeTR.Add(138, 4);
        isoBandEdgeRB.Add(138, 1);
        isoBandEdgeTL.Add(138, 1);
        isoBandEdgeLB.Add(128, 21);
        isoBandEdgeTR.Add(128, 21);
        isoBandEdgeLT.Add(128, 22);
        isoBandEdgeTL.Add(128, 22);
        isoBandEdgeLB.Add(42, 21);
        isoBandEdgeTR.Add(42, 21);
        isoBandEdgeLT.Add(42, 22);
        isoBandEdgeTL.Add(42, 22);
        isoBandEdgeRB.Add(5, 14);
        isoBandEdgeLB.Add(5, 14);
        isoBandEdgeRB.Add(165, 14);
        isoBandEdgeLB.Add(165, 14);
        isoBandEdgeBR.Add(20, 6);
        isoBandEdgeTR.Add(20, 6);
        isoBandEdgeBR.Add(150, 6);
        isoBandEdgeTR.Add(150, 6);
        isoBandEdgeRT.Add(80, 11);
        isoBandEdgeLT.Add(80, 11);
        isoBandEdgeRT.Add(90, 11);
        isoBandEdgeLT.Add(90, 11);
        isoBandEdgeBL.Add(65, 3);
        isoBandEdgeTL.Add(65, 3);
        isoBandEdgeBL.Add(105, 3);
        isoBandEdgeTL.Add(105, 3);
        isoBandEdgeRT.Add(160, 11);
        isoBandEdgeLT.Add(160, 11);
        isoBandEdgeRB.Add(160, 14);
        isoBandEdgeLB.Add(160, 14);
        isoBandEdgeRT.Add(10, 11);
        isoBandEdgeLT.Add(10, 11);
        isoBandEdgeRB.Add(10, 14);
        isoBandEdgeLB.Add(10, 14);
        isoBandEdgeBR.Add(130, 6);
        isoBandEdgeTR.Add(130, 6);
        isoBandEdgeBL.Add(130, 3);
        isoBandEdgeTL.Add(130, 3);
        isoBandEdgeBR.Add(40, 6);
        isoBandEdgeTR.Add(40, 6);
        isoBandEdgeBL.Add(40, 3);
        isoBandEdgeTL.Add(40, 3);
        isoBandEdgeRB.Add(101, 1);
        isoBandEdgeTL.Add(101, 1);
        isoBandEdgeRB.Add(69, 1);
        isoBandEdgeTL.Add(69, 1);
        isoBandEdgeLB.Add(149, 21);
        isoBandEdgeTR.Add(149, 21);
        isoBandEdgeLB.Add(21, 21);
        isoBandEdgeTR.Add(21, 21);
        isoBandEdgeBR.Add(86, 17);
        isoBandEdgeLT.Add(86, 17);
        isoBandEdgeBR.Add(84, 17);
        isoBandEdgeLT.Add(84, 17);
        isoBandEdgeRT.Add(89, 9);
        isoBandEdgeBL.Add(89, 9);
        isoBandEdgeRT.Add(81, 9);
        isoBandEdgeBL.Add(81, 9);
        isoBandEdgeRT.Add(96, 0);
        isoBandEdgeTL.Add(96, 0);
        isoBandEdgeRB.Add(96, 15);
        isoBandEdgeLT.Add(96, 15);
        isoBandEdgeRT.Add(74, 0);
        isoBandEdgeTL.Add(74, 0);
        isoBandEdgeRB.Add(74, 15);
        isoBandEdgeLT.Add(74, 15);
        isoBandEdgeRT.Add(24, 8);
        isoBandEdgeBR.Add(24, 8);
        isoBandEdgeBL.Add(24, 7);
        isoBandEdgeTR.Add(24, 7);
        isoBandEdgeRT.Add(146, 8);
        isoBandEdgeBR.Add(146, 8);
        isoBandEdgeBL.Add(146, 7);
        isoBandEdgeTR.Add(146, 7);
        isoBandEdgeRB.Add(6, 15);
        isoBandEdgeLT.Add(6, 15);
        isoBandEdgeBR.Add(6, 16);
        isoBandEdgeLB.Add(6, 16);
        isoBandEdgeRB.Add(164, 15);
        isoBandEdgeLT.Add(164, 15);
        isoBandEdgeBR.Add(164, 16);
        isoBandEdgeLB.Add(164, 16);
        isoBandEdgeBL.Add(129, 7);
        isoBandEdgeTR.Add(129, 7);
        isoBandEdgeLB.Add(129, 20);
        isoBandEdgeTL.Add(129, 20);
        isoBandEdgeBL.Add(41, 7);
        isoBandEdgeTR.Add(41, 7);
        isoBandEdgeLB.Add(41, 20);
        isoBandEdgeTL.Add(41, 20);
        isoBandEdgeBR.Add(66, 2);
        isoBandEdgeTL.Add(66, 2);
        isoBandEdgeBL.Add(66, 19);
        isoBandEdgeLT.Add(66, 19);
        isoBandEdgeBR.Add(104, 2);
        isoBandEdgeTL.Add(104, 2);
        isoBandEdgeBL.Add(104, 19);
        isoBandEdgeLT.Add(104, 19);
        isoBandEdgeRT.Add(144, 10);
        isoBandEdgeLB.Add(144, 10);
        isoBandEdgeLT.Add(144, 23);
        isoBandEdgeTR.Add(144, 23);
        isoBandEdgeRT.Add(26, 10);
        isoBandEdgeLB.Add(26, 10);
        isoBandEdgeLT.Add(26, 23);
        isoBandEdgeTR.Add(26, 23);
        isoBandEdgeRB.Add(36, 5);
        isoBandEdgeTR.Add(36, 5);
        isoBandEdgeBR.Add(36, 2);
        isoBandEdgeTL.Add(36, 2);
        isoBandEdgeRB.Add(134, 5);
        isoBandEdgeTR.Add(134, 5);
        isoBandEdgeBR.Add(134, 2);
        isoBandEdgeTL.Add(134, 2);
        isoBandEdgeRT.Add(9, 10);
        isoBandEdgeLB.Add(9, 10);
        isoBandEdgeRB.Add(9, 13);
        isoBandEdgeBL.Add(9, 13);
        isoBandEdgeRT.Add(161, 10);
        isoBandEdgeLB.Add(161, 10);
        isoBandEdgeRB.Add(161, 13);
        isoBandEdgeBL.Add(161, 13);
        isoBandEdgeRB.Add(37, 5);
        isoBandEdgeTR.Add(37, 5);
        isoBandEdgeLB.Add(37, 20);
        isoBandEdgeTL.Add(37, 20);
        isoBandEdgeRB.Add(133, 5);
        isoBandEdgeTR.Add(133, 5);
        isoBandEdgeLB.Add(133, 20);
        isoBandEdgeTL.Add(133, 20);
        isoBandEdgeBR.Add(148, 16);
        isoBandEdgeLB.Add(148, 16);
        isoBandEdgeLT.Add(148, 23);
        isoBandEdgeTR.Add(148, 23);
        isoBandEdgeBR.Add(22, 16);
        isoBandEdgeLB.Add(22, 16);
        isoBandEdgeLT.Add(22, 23);
        isoBandEdgeTR.Add(22, 23);
        isoBandEdgeRT.Add(82, 8);
        isoBandEdgeBR.Add(82, 8);
        isoBandEdgeBL.Add(82, 19);
        isoBandEdgeLT.Add(82, 19);
        isoBandEdgeRT.Add(88, 8);
        isoBandEdgeBR.Add(88, 8);
        isoBandEdgeBL.Add(88, 19);
        isoBandEdgeLT.Add(88, 19);
        isoBandEdgeRT.Add(73, 0);
        isoBandEdgeTL.Add(73, 0);
        isoBandEdgeRB.Add(73, 13);
        isoBandEdgeBL.Add(73, 13);
        isoBandEdgeRT.Add(97, 0);
        isoBandEdgeTL.Add(97, 0);
        isoBandEdgeRB.Add(97, 13);
        isoBandEdgeBL.Add(97, 13);
        isoBandEdgeRT.Add(145, 9);
        isoBandEdgeBL.Add(145, 9);
        isoBandEdgeLB.Add(145, 21);
        isoBandEdgeTR.Add(145, 21);
        isoBandEdgeRT.Add(25, 9);
        isoBandEdgeBL.Add(25, 9);
        isoBandEdgeLB.Add(25, 21);
        isoBandEdgeTR.Add(25, 21);
        isoBandEdgeRB.Add(70, 1);
        isoBandEdgeTL.Add(70, 1);
        isoBandEdgeBR.Add(70, 17);
        isoBandEdgeLT.Add(70, 17);
        isoBandEdgeRB.Add(100, 1);
        isoBandEdgeTL.Add(100, 1);
        isoBandEdgeBR.Add(100, 17);
        isoBandEdgeLT.Add(100, 17);
        isoBandEdgeRT.Add(34, 9);
        isoBandEdgeBL.Add(34, 9);
        isoBandEdgeRB.Add(34, 12);
        isoBandEdgeBR.Add(34, 12);
        isoBandEdgeLB.Add(34, 21);
        isoBandEdgeTR.Add(34, 21);
        isoBandEdgeLT.Add(34, 22);
        isoBandEdgeTL.Add(34, 22);
        isoBandEdgeRT.Add(136, 4);
        isoBandEdgeTR.Add(136, 4);
        isoBandEdgeRB.Add(136, 1);
        isoBandEdgeTL.Add(136, 1);
        isoBandEdgeBR.Add(136, 17);
        isoBandEdgeLT.Add(136, 17);
        isoBandEdgeBL.Add(136, 18);
        isoBandEdgeLB.Add(136, 18);
        isoBandEdgeRT.Add(35, 4);
        isoBandEdgeTR.Add(35, 4);
        isoBandEdgeRB.Add(35, 12);
        isoBandEdgeBR.Add(35, 12);
        isoBandEdgeBL.Add(35, 18);
        isoBandEdgeLB.Add(35, 18);
        isoBandEdgeLT.Add(35, 22);
        isoBandEdgeTL.Add(35, 22);
        isoBandEdgeRT.Add(153, 4);
        isoBandEdgeTR.Add(153, 4);
        isoBandEdgeBL.Add(153, 18);
        isoBandEdgeLB.Add(153, 18);
        isoBandEdgeRB.Add(102, 12);
        isoBandEdgeBR.Add(102, 12);
        isoBandEdgeLT.Add(102, 22);
        isoBandEdgeTL.Add(102, 22);
        isoBandEdgeRT.Add(155, 9);
        isoBandEdgeBL.Add(155, 9);
        isoBandEdgeLB.Add(155, 23);
        isoBandEdgeTR.Add(155, 23);
        isoBandEdgeRB.Add(103, 1);
        isoBandEdgeTL.Add(103, 1);
        isoBandEdgeBR.Add(103, 17);
        isoBandEdgeLT.Add(103, 17);
        isoBandEdgeRT.Add(152, 4);
        isoBandEdgeTR.Add(152, 4);
        isoBandEdgeBR.Add(152, 17);
        isoBandEdgeLT.Add(152, 17);
        isoBandEdgeBL.Add(152, 18);
        isoBandEdgeLB.Add(152, 18);
        isoBandEdgeRT.Add(156, 8);
        isoBandEdgeBR.Add(156, 8);
        isoBandEdgeBL.Add(156, 18);
        isoBandEdgeLB.Add(156, 18);
        isoBandEdgeLT.Add(156, 23);
        isoBandEdgeTR.Add(156, 23);
        isoBandEdgeRT.Add(137, 4);
        isoBandEdgeTR.Add(137, 4);
        isoBandEdgeRB.Add(137, 1);
        isoBandEdgeTL.Add(137, 1);
        isoBandEdgeBL.Add(137, 18);
        isoBandEdgeLB.Add(137, 18);
        isoBandEdgeRT.Add(139, 4);
        isoBandEdgeTR.Add(139, 4);
        isoBandEdgeRB.Add(139, 13);
        isoBandEdgeBL.Add(139, 13);
        isoBandEdgeLB.Add(139, 20);
        isoBandEdgeTL.Add(139, 20);
        isoBandEdgeRT.Add(98, 9);
        isoBandEdgeBL.Add(98, 9);
        isoBandEdgeRB.Add(98, 12);
        isoBandEdgeBR.Add(98, 12);
        isoBandEdgeLT.Add(98, 22);
        isoBandEdgeTL.Add(98, 22);
        isoBandEdgeRT.Add(99, 0);
        isoBandEdgeTL.Add(99, 0);
        isoBandEdgeRB.Add(99, 12);
        isoBandEdgeBR.Add(99, 12);
        isoBandEdgeBL.Add(99, 19);
        isoBandEdgeLT.Add(99, 19);
        isoBandEdgeRB.Add(38, 12);
        isoBandEdgeBR.Add(38, 12);
        isoBandEdgeLB.Add(38, 21);
        isoBandEdgeTR.Add(38, 21);
        isoBandEdgeLT.Add(38, 22);
        isoBandEdgeTL.Add(38, 22);
        isoBandEdgeRB.Add(39, 5);
        isoBandEdgeTR.Add(39, 5);
        isoBandEdgeBR.Add(39, 16);
        isoBandEdgeLB.Add(39, 16);
        isoBandEdgeLT.Add(39, 22);
        isoBandEdgeTL.Add(39, 22);

        /* triangle cases */
        polygon_table.Add(1, p00);
		polygon_table.Add(169,p00); /* 2221 || 0001 */
        polygon_table.Add(4,p01);
		polygon_table.Add(166,p01); /* 2212 || 0010 */
        polygon_table.Add(16,p02);
		polygon_table.Add(154,p02); /* 2122 || 0100 */
        polygon_table.Add(64,p03);
		polygon_table.Add(106,p03); /* 1222 || 1000 */
        polygon_table.Add(168,p04) ;
		polygon_table.Add(2,p04); /* 2220 || 0002 */
        polygon_table.Add(162,p05);
		polygon_table.Add(8,p05); /* 2202 || 0020 */
        polygon_table.Add(138,p06) ;
		polygon_table.Add(32,p06); /* 2022 || 0200 */
        polygon_table.Add(42,p07);
		polygon_table.Add(128,p07); /* 0222 || 2000 */
        polygon_table.Add(5, p08);
		polygon_table.Add(165,p08); /* 0011 || 2211 */
        polygon_table.Add(20, p09);
		polygon_table.Add(150,p09); /* 0110 || 2112 */
        polygon_table.Add(80, p10);
		polygon_table.Add(90,p10); /* 1100 || 1122 */
        polygon_table.Add(65, p11);
		polygon_table.Add(105,p11); /* 1001 || 1221 */
        polygon_table.Add(160, p12);
		polygon_table.Add(10,p12); /* 2200 || 0022 */
        polygon_table.Add(130, p13);
		polygon_table.Add(40,p13); /* 2002 || 0220 */
        polygon_table.Add(85,p14); /* 1111 */
        polygon_table.Add(101, p15 );
		polygon_table.Add(69,p15); /* 1211 || 1011 */
        polygon_table.Add(149, p16 );
		polygon_table.Add(21,p16); /* 2111 || 0111 */
        polygon_table.Add(86, p17 );
		polygon_table.Add(84,p17); /* 1112 || 1110 */
        polygon_table.Add(89, p18 );
		polygon_table.Add(81,p18); /* 1121 || 1101 */
        polygon_table.Add(96, p19 );
		polygon_table.Add(74,p19); /* 1200 || 1022 */
        polygon_table.Add(24, p20 );
		polygon_table.Add(146,p20); /* 0120 || 2102 */
        polygon_table.Add(6, p21 );
		polygon_table.Add(164,p21); /* 0012 || 2210 */
        polygon_table.Add(129, p22 );
		polygon_table.Add(41,p22); /* 2001 || 0221 */
        polygon_table.Add(66, p23 );
		polygon_table.Add(104,p23); /* 1002 || 1220 */
        polygon_table.Add(144, p24 );
		polygon_table.Add(26,p24); /* 2100 || 0122 */
        polygon_table.Add(36, p25 );
		polygon_table.Add(134,p25); /* 0210 || 2012 */
        polygon_table.Add(9, p26 );
		polygon_table.Add(161,p26); /* 0021 || 2201 */
        polygon_table.Add(37, p27 );
		polygon_table.Add(133,p27); /* 0211 || 2011 */
        polygon_table.Add(148, p28 );
		polygon_table.Add(22,p28); /* 2110 || 0112 */
        polygon_table.Add(82, p29 );
		polygon_table.Add(88,p29); /* 1102 || 1120 */
        polygon_table.Add(73, p30 );
		polygon_table.Add(97,p30); /* 1021 || 1201 */
        polygon_table.Add(145, p31 );
		polygon_table.Add(25,p31); /* 2101 || 0121 */
        polygon_table.Add(70, p32 );
		polygon_table.Add(100,p32); /* 1012 || 1210 */
        polygon_table.Add(34, new Func<Cells, object>( c =>  new List<object> { p07(c), p05(c) } )); /* 0202 || 2020 with flipped == 0 */
        polygon_table.Add(35,p33); /* flipped == 1 state for 0202 and 2020 */
        polygon_table.Add(136,new Func<Cells, object>( c =>  new List<object> { p06(c), p04(c) } )); /* 2020 || 0202 with flipped == 0 */
        polygon_table.Add(153,new Func<Cells, object>( c =>  new List<object> { p02(c), p00(c) } )); /* 0101 with flipped == 0 || 2121 with flipped == 2 */
        polygon_table.Add(102,new Func<Cells, object>( c =>  new List<object> { p01(c), p03(c) } )); /* 1010 with flipped == 0 || 1212 with flipped == 2 */
        polygon_table.Add(155,p34); /* 0101 with flipped == 1 || 2121 with flipped == 1 */
        polygon_table.Add(103,p35); /* 1010 with flipped == 1 || 1212 with flipped == 1 */
        polygon_table.Add(152,new Func<Cells, object>( c =>  new List<object> { p02(c), p04(c) } )); /* 2120 with flipped == 2 || 0102 with flipped == 0 */
        polygon_table.Add(156,p36); /* 2120 with flipped == 1 || 0102 with flipped == 1 */
        polygon_table.Add(137,new Func<Cells, object>( c =>  new List<object> {p06(c), p00(c)})); /* 2021 with flipped == 2 || 0201 with flipped == 0 */
        polygon_table.Add(139,p37); /* 2021 with flipped == 1 || 0201 with flipped == 1 */
        polygon_table.Add(98,new Func<Cells, object>( c =>  new List<object> {p05(c), p03(c)})); /* 1202 with flipped == 2 || 1020 with flipped == 0 */
        polygon_table.Add(99,p38); /* 1202 with flipped == 1 || 1020 with flipped == 1 */
        polygon_table.Add(38,new Func<Cells, object>( c =>  new List<object> {p01(c), p07(c)})); /* 0212 with flipped == 2 || 2010 with flipped == 0 */
        polygon_table.Add(39,p39); /* 0212 with flipped == 1 || 2010 with flipped == 1 */

    }

    private List<List<double>> p00(Cells cell) { return new List<List<double>> { new List<double> { cell.bottomleft, 0 }, new List<double> { 0, 0 }, new List<double> { 0, cell.leftbottom } }; }
    private List<List<double>> p01(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.rightbottom }, new List<double> { 1, 0 }, new List<double> { cell.bottomright, 0 } }; }
    private List<List<double>> p02(Cells cell) { return new List<List<double>> { new List<double> { cell.topright, 1 }, new List<double> { 1, 1 }, new List<double> { 1, cell.righttop } }; }
    private List<List<double>> p03(Cells cell) { return new List<List<double>> { new List<double> { 0, cell.lefttop }, new List<double> { 0, 1 }, new List<double> { cell.topleft, 1 } }; }
    private List<List<double>> p04(Cells cell) { return new List<List<double>> { new List<double> { cell.bottomright, 0 }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { 0, cell.lefttop } }; }
    private List<List<double>> p05(Cells cell) { return new List<List<double>> { new List<double> { cell.bottomright, 0 }, new List<double> { cell.bottomleft, 0 }, new List<double> { 1, cell.righttop }, new List<double> { 1, cell.rightbottom } }; }
    private List<List<double>> p06(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.righttop }, new List<double> { 1, cell.rightbottom }, new List<double> { cell.topleft, 1 }, new List<double> { cell.topright, 1 } }; }
    private List<List<double>> p07(Cells cell) { return new List<List<double>> { new List<double> { 0, cell.leftbottom }, new List<double> { 0, cell.lefttop }, new List<double> { cell.topleft, 1 }, new List<double> { cell.topright, 1 } }; }
    private List<List<double>> p08(Cells cell) { return new List<List<double>> { new List<double> { 0, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { 1, cell.rightbottom }, new List<double> { 1, 0 } }; }
    private List<List<double>> p09(Cells cell) { return new List<List<double>> { new List<double> { 1, 0 }, new List<double> { cell.bottomright, 0 }, new List<double> { cell.topright, 1 }, new List<double> { 1, 1 } }; }
    private List<List<double>> p10(Cells cell) { return new List<List<double>> { new List<double> { 1, 1 }, new List<double> { 1, cell.righttop }, new List<double> { 0, cell.lefttop }, new List<double> { 0, 1 } }; }
    private List<List<double>> p11(Cells cell) { return new List<List<double>> { new List<double> { cell.bottomleft, 0 }, new List<double> { 0, 0 }, new List<double> { 0, 1 }, new List<double> { cell.topleft, 1 } }; }
    private List<List<double>> p12(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.righttop }, new List<double> { 1, cell.rightbottom }, new List<double> { 0, cell.leftbottom }, new List<double> { 0, cell.lefttop } }; }
    private List<List<double>> p13(Cells cell) { return new List<List<double>> { new List<double> { cell.topleft, 1 }, new List<double> { cell.topright, 1 }, new List<double> { cell.bottomright, 0 }, new List<double> { cell.bottomleft, 0 } }; }
    private List<List<double>> p14(Cells cell) { return new List<List<double>> { new List<double> { 0, 0 }, new List<double> { 0, 1 }, new List<double> { 1, 1 }, new List<double> { 1, 0 } }; }
    private List<List<double>> p15(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.rightbottom }, new List<double> { 1, 0 }, new List<double> { 0, 0 }, new List<double> { 0, 1 }, new List<double> { cell.topleft, 1 } }; } /* 1211 || 1011 */
    private List<List<double>> p16(Cells cell) { return new List<List<double>> { new List<double> { cell.topright, 1 }, new List<double> { 1, 1 }, new List<double> { 1, 0 }, new List<double> { 0, 0 }, new List<double> { 0, cell.leftbottom } }; }/* 2111 || 0111 */
    private List<List<double>> p17(Cells cell) { return new List<List<double>> { new List<double> { 1, 0 }, new List<double> { cell.bottomright, 0 }, new List<double> { 0, cell.lefttop }, new List<double> { 0, 1 }, new List<double> { 1, 1 } }; } /* 1112 || 1110 */
    private List<List<double>> p18(Cells cell) { return new List<List<double>> { new List<double> { 1, 1 }, new List<double> { 1, cell.righttop }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, 0 }, new List<double> { 0, 1 } }; } /* 1121 || 1101 */
    private List<List<double>> p19(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.righttop }, new List<double> { 1, cell.rightbottom }, new List<double> { 0, cell.lefttop }, new List<double> { 0, 1 }, new List<double> { cell.topleft, 1 } }; } /* 1200 || 1022 */
    private List<List<double>> p20(Cells cell) { return new List<List<double>> { new List<double> { 1, 1 }, new List<double> { 1, cell.righttop }, new List<double> { cell.bottomright, 0 }, new List<double> { cell.bottomleft, 0 }, new List<double> { cell.topright, 1 } }; } /* 0120 || 2102 */
    private List<List<double>> p21(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.rightbottom }, new List<double> { 1, 0 }, new List<double> { cell.bottomright, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { 0, cell.lefttop } }; } /* 0012 || 2210 */
    private List<List<double>> p22(Cells cell) { return new List<List<double>> { new List<double> { cell.topright, 1 }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { cell.topleft, 1 } }; } /* 2001 || 0221 */
    private List<List<double>> p23(Cells cell) { return new List<List<double>> { new List<double> { cell.bottomright, 0 }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, cell.lefttop }, new List<double> { 0, 1 }, new List<double> { cell.topleft, 1 } }; } /* 1002 || 1220 */
    private List<List<double>> p24(Cells cell) { return new List<List<double>> { new List<double> { 1, 1 }, new List<double> { 1, cell.righttop }, new List<double> { 0, cell.leftbottom }, new List<double> { 0, cell.lefttop }, new List<double> { cell.topright, 1 } }; }/* 2100 || 0122 */
    private List<List<double>> p25(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.rightbottom }, new List<double> { 1, 0 }, new List<double> { cell.bottomright, 0 }, new List<double> { cell.topleft, 1 }, new List<double> { cell.topright, 1 } }; } /* 0210 || 2012 */
    private List<List<double>> p26(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.righttop }, new List<double> { 1, cell.rightbottom }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, 0 }, new List<double> { 0, cell.leftbottom } }; } /* 0021 || 2201 */
    private List<List<double>> p27(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.rightbottom }, new List<double> { 1, 0 }, new List<double> { 0, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { cell.topleft, 1 }, new List<double> { cell.topright, 1 } }; } /* 0211 || 2011 */
    private List<List<double>> p28(Cells cell) { return new List<List<double>> { new List<double> { 1, 1 }, new List<double> { 1, 0 }, new List<double> { cell.bottomright, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { 0, cell.lefttop }, new List<double> { cell.topright, 1 } }; } /* 2110 || 0112 */
    private List<List<double>> p29(Cells cell) { return new List<List<double>> { new List<double> { 1, 1 }, new List<double> { 1, cell.righttop }, new List<double> { cell.bottomright, 0 }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, cell.lefttop }, new List<double> { 0, 1 } }; } /* 1102 || 1120 */
    private List<List<double>> p30(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.righttop }, new List<double> { 1, cell.rightbottom }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, 0 }, new List<double> { 0, 1 }, new List<double> { cell.topleft, 1 } }; } /* 1021 || 1201 */
    private List<List<double>> p31(Cells cell) { return new List<List<double>> { new List<double> { 1, 1 }, new List<double> { 1, cell.righttop }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { cell.topright, 1 } }; } /* 2101 || 0121 */
    private List<List<double>> p32(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.rightbottom }, new List<double> { 1, 0 }, new List<double> { cell.bottomright, 0 }, new List<double> { 0, cell.lefttop }, new List<double> { 0, 1 }, new List<double> { cell.topleft, 1 } }; } /* 1012 || 1210 */
    private List<List<double>> p33(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.righttop }, new List<double> { 1, cell.rightbottom }, new List<double> { cell.bottomright, 0 }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { 0, cell.lefttop }, new List<double> { cell.topleft, 1 }, new List<double> { cell.topright, 1 } }; } /* flipped == 1 state for 0202 and 2020 */
    private List<List<double>> p34(Cells cell) { return new List<List<double>> { new List<double> { 1, 1 }, new List<double> { 1, cell.righttop }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { cell.topright, 1 } }; } /* 0101 with flipped == 1 || 2121 with flipped == 1 */
    private List<List<double>> p35(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.rightbottom }, new List<double> { 1, 0 }, new List<double> { cell.bottomright, 0 }, new List<double> { 0, cell.lefttop }, new List<double> { 0, 1 }, new List<double> { cell.topleft, 1 } }; } /* 1010 with flipped == 1 || 1212 with flipped == 1 */
    private List<List<double>> p36(Cells cell) { return new List<List<double>> { new List<double> { 1, 1 }, new List<double> { 1, cell.righttop }, new List<double> { cell.bottomright, 0 }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { 0, cell.lefttop }, new List<double> { cell.topright, 1 } }; } /* 2120 with flipped == 1 || 0102 with flipped == 1 */
    private List<List<double>> p37(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.righttop }, new List<double> { 1, cell.rightbottom }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { cell.topleft, 1 }, new List<double> { cell.topright, 1 } }; } /* 2021 with flipped == 1 || 0201 with flipped == 1 */
    private List<List<double>> p38(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.righttop }, new List<double> { 1, cell.rightbottom }, new List<double> { cell.bottomright, 0 }, new List<double> { cell.bottomleft, 0 }, new List<double> { 0, cell.lefttop }, new List<double> { 0, 1 }, new List<double> { cell.topleft, 1 } }; } /* 1202 with flipped == 1 || 1020 with flipped == 1 */
    private List<List<double>> p39(Cells cell) { return new List<List<double>> { new List<double> { 1, cell.rightbottom }, new List<double> { 1, 0 }, new List<double> { cell.bottomright, 0 }, new List<double> { 0, cell.leftbottom }, new List<double> { 0, cell.lefttop }, new List<double> { cell.topleft, 1 }, new List<double> { cell.topright, 1 } }; } /* 0212 with flipped == 1 || 2010 with flipped == 1 */

    private double interpolateX(double y, double y0, double y1)
    {
        return (y - y0) / (y1 - y0);
    }



    /*
    ####################################
        Below is the actual Marching Squares implementation
    ####################################
      */

    public List<List<List<double>>> IsoBand(List<List<double>> data, double minV, double bandwidth)
    {
        BandGrid bg = computeBandGrid(data, minV, bandwidth);
        return BandGrid2Areas(bg);

    }

    public List<List<List<double>>> IsoPath(List<List<double>> data, double minV, double bandwidth)
    {
        BandGrid bg = computeBandGrid(data, minV, bandwidth);
        return BandGrid2AreaPaths(bg);
    }


    private BandGrid computeBandGrid(List<List<double>> data, double minV, double bandwidth)
    {
        int rows = data.Count - 1;
        int cols = data[0].Count - 1;
        BandGrid BandGrid = new BandGrid(rows, cols);

        double maxV = minV + Math.Abs(bandwidth);

        for (int j = 0; j < rows; ++j) {
            for (int i = 0; i < cols; ++i) {
                /*  compose the 4-trit corner representation */
                int cval = 0;

                double tl = data[j + 1][i];
                double tr = data[j + 1][i + 1];
                double br = data[j][i + 1];
                double bl = data[j][i];

                if (Double.IsNaN(tl) || Double.IsNaN(tr) || Double.IsNaN(br) || Double.IsNaN(bl)) {
                    continue;
                }

                cval |= (tl < minV) ? 0 : (tl > maxV) ? 128 : 64;
                cval |= (tr < minV) ? 0 : (tr > maxV) ? 32 : 16;
                cval |= (br < minV) ? 0 : (br > maxV) ? 8 : 4;
                cval |= (bl < minV) ? 0 : (bl > maxV) ? 2 : 1;

                int cval_real = +cval;

                /* resolve ambiguity via averaging */
                int flipped = 0;
                if ((cval == 17) /* 0101 */
                    || (cval == 18) /* 0102 */
                    || (cval == 33) /* 0201 */
                    || (cval == 34) /* 0202 */
                    || (cval == 38) /* 0212 */
                    || (cval == 68) /* 1010 */
                    || (cval == 72) /* 1020 */
                    || (cval == 98) /* 1202 */
                    || (cval == 102) /* 1212 */
                    || (cval == 132) /* 2010 */
                    || (cval == 136) /* 2020 */
                    || (cval == 137) /* 2021 */
                    || (cval == 152) /* 2120 */
                    || (cval == 153) /* 2121 */
                ) {
                    double average = (tl + tr + br + bl) / 4;
                    /* set flipped state */
                    flipped = (average > maxV) ? 2 : (average < minV) ? 0 : 1;

                    /* adjust cval for flipped cases */

                    /* 8-sided cases */
                    if (cval == 34) {
                        if (flipped == 1) {
                            cval = 35;
                        } else if (flipped == 0) {
                            cval = 136;
                        }
                    } else if (cval == 136) {
                        if (flipped == 1) {
                            cval = 35;
                            flipped = 4;
                        } else if (flipped == 0) {
                            cval = 34;
                        }
                    }

                    /* 6-sided polygon cases */
                    else if (cval == 17) {
                        if (flipped == 1) {
                            cval = 155;
                            flipped = 4;
                        } else if (flipped == 0) {
                            cval = 153;
                        }
                    } else if (cval == 68) {
                        if (flipped == 1) {
                            cval = 103;
                            flipped = 4;
                        } else if (flipped == 0) {
                            cval = 102;
                        }
                    } else if (cval == 153) {
                        if (flipped == 1)
                            cval = 155;
                    } else if (cval == 102) {
                        if (flipped == 1)
                            cval = 103;
                    }

                    /* 7-sided polygon cases */
                    else if (cval == 152) {
                        if (flipped < 2) {
                            cval = 156;
                            flipped = 1;
                        }
                    } else if (cval == 137) {
                        if (flipped < 2) {
                            cval = 139;
                            flipped = 1;
                        }
                    } else if (cval == 98) {
                        if (flipped < 2) {
                            cval = 99;
                            flipped = 1;
                        }
                    } else if (cval == 38) {
                        if (flipped < 2) {
                            cval = 39;
                            flipped = 1;
                        }
                    } else if (cval == 18) {
                        if (flipped > 0) {
                            cval = 156;
                            flipped = 4;
                        } else {
                            cval = 152;
                        }
                    } else if (cval == 33) {
                        if (flipped > 0) {
                            cval = 139;
                            flipped = 4;
                        } else {
                            cval = 137;
                        }
                    } else if (cval == 72) {
                        if (flipped > 0) {
                            cval = 99;
                            flipped = 4;
                        } else {
                            cval = 98;
                        }
                    } else if (cval == 132) {
                        if (flipped > 0) {
                            cval = 39;
                            flipped = 4;
                        } else {
                            cval = 38;
                        }
                    }
                }

                /* add cell to BandGrid if it contains at least one polygon-side */
                if ((cval != 0) && (cval != 170)) {
                    double topleft, topright, bottomleft, bottomright,
                        righttop, rightbottom, lefttop, leftbottom;

                    topleft = topright = bottomleft = bottomright = righttop
                                      = rightbottom = lefttop = leftbottom = 0.5;

                    List<int> edges = new List<int>();

                    /* do interpolation here */
                    /* 1st Triangles */
                    if (cval == 1) { /* 0001 */
                        bottomleft = 1 - interpolateX(minV, br, bl);
                        leftbottom = 1 - interpolateX(minV, tl, bl);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 169) { /* 2221 */
                        bottomleft = interpolateX(maxV, bl, br);
                        leftbottom = interpolateX(maxV, bl, tl);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 4) { /* 0010 */
                        rightbottom = 1 - interpolateX(minV, tr, br);
                        bottomright = interpolateX(minV, bl, br);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 166) { /* 2212 */
                        rightbottom = interpolateX(maxV, br, tr);
                        bottomright = 1 - interpolateX(maxV, br, bl);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 16) { /* 0100 */
                        righttop = interpolateX(minV, br, tr);
                        topright = interpolateX(minV, tl, tr);
                        edges.Add(isoBandEdgeRT[cval]);
                    } else if (cval == 154) { /* 2122 */
                        righttop = 1 - interpolateX(maxV, tr, br);
                        topright = 1 - interpolateX(maxV, tr, tl);
                        edges.Add(isoBandEdgeRT[cval]);
                    } else if (cval == 64) { /* 1000 */
                        lefttop = interpolateX(minV, bl, tl);
                        topleft = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 106) { /* 1222 */
                        lefttop = 1 - interpolateX(maxV, tl, bl);
                        topleft = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeLT[cval]);
                    }
                    /* 2nd Trapezoids */
                    else if (cval == 168) { /* 2220 */
                        bottomright = interpolateX(maxV, bl, br);
                        bottomleft = interpolateX(minV, bl, br);
                        leftbottom = interpolateX(minV, bl, tl);
                        lefttop = interpolateX(maxV, bl, tl);
                        edges.Add(isoBandEdgeBR[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 2) { /* 0002 */
                        bottomright = 1 - interpolateX(minV, br, bl);
                        bottomleft = 1 - interpolateX(maxV, br, bl);
                        leftbottom = 1 - interpolateX(maxV, tl, bl);
                        lefttop = 1 - interpolateX(minV, tl, bl);
                        edges.Add(isoBandEdgeBR[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 162) { /* 2202 */
                        righttop = interpolateX(maxV, br, tr);
                        rightbottom = interpolateX(minV, br, tr);
                        bottomright = 1 - interpolateX(minV, br, bl);
                        bottomleft = 1 - interpolateX(maxV, br, bl);
                        edges.Add(isoBandEdgeBR[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 8) { /* 0020 */
                        righttop = 1 - interpolateX(minV, tr, br);
                        rightbottom = 1 - interpolateX(maxV, tr, br);
                        bottomright = interpolateX(maxV, bl, br);
                        bottomleft = interpolateX(minV, bl, br);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 138) { /* 2022 */
                        righttop = 1 - interpolateX(minV, tr, br);
                        rightbottom = 1 - interpolateX(maxV, tr, br);
                        topleft = 1 - interpolateX(maxV, tr, tl);
                        topright = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 32) { /* 0200 */
                        righttop = interpolateX(maxV, br, tr);
                        rightbottom = interpolateX(minV, br, tr);
                        topleft = interpolateX(minV, tl, tr);
                        topright = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 42) { /* 0222 */
                        leftbottom = 1 - interpolateX(maxV, tl, bl);
                        lefttop = 1 - interpolateX(minV, tl, bl);
                        topleft = interpolateX(minV, tl, tr);
                        topright = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeLB[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 128) { /* 2000 */
                        leftbottom = interpolateX(minV, bl, tl);
                        lefttop = interpolateX(maxV, bl, tl);
                        topleft = 1 - interpolateX(maxV, tr, tl);
                        topright = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeLB[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    }

                    /* 3rd rectangle cases */
                    if (cval == 5) { /* 0011 */
                        rightbottom = 1 - interpolateX(minV, tr, br);
                        leftbottom = 1 - interpolateX(minV, tl, bl);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 165) { /* 2211 */
                        rightbottom = interpolateX(maxV, br, tr);
                        leftbottom = interpolateX(maxV, bl, tl);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 20) { /* 0110 */
                        bottomright = interpolateX(minV, bl, br);
                        topright = interpolateX(minV, tl, tr);
                        edges.Add(isoBandEdgeBR[cval]);
                    } else if (cval == 150) { /* 2112 */
                        bottomright = 1 - interpolateX(maxV, br, bl);
                        topright = 1 - interpolateX(maxV, tr, tl);
                        edges.Add(isoBandEdgeBR[cval]);
                    } else if (cval == 80) { /* 1100 */
                        righttop = interpolateX(minV, br, tr);
                        lefttop = interpolateX(minV, bl, tl);
                        edges.Add(isoBandEdgeRT[cval]);
                    } else if (cval == 90) { /* 1122 */
                        righttop = 1 - interpolateX(maxV, tr, br);
                        lefttop = 1 - interpolateX(maxV, tl, bl);
                        edges.Add(isoBandEdgeRT[cval]);
                    } else if (cval == 65) { /* 1001 */
                        bottomleft = 1 - interpolateX(minV, br, bl);
                        topleft = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 105) { /* 1221 */
                        bottomleft = interpolateX(maxV, bl, br);
                        topleft = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 160) { /* 2200 */
                        righttop = interpolateX(maxV, br, tr);
                        rightbottom = interpolateX(minV, br, tr);
                        leftbottom = interpolateX(minV, bl, tl);
                        lefttop = interpolateX(maxV, bl, tl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 10) { /* 0022 */
                        righttop = 1 - interpolateX(minV, tr, br);
                        rightbottom = 1 - interpolateX(maxV, tr, br);
                        leftbottom = 1 - interpolateX(maxV, tl, bl);
                        lefttop = 1 - interpolateX(minV, tl, bl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 130) { /* 2002 */
                        bottomright = 1 - interpolateX(minV, br, bl);
                        bottomleft = 1 - interpolateX(maxV, br, bl);
                        topleft = 1 - interpolateX(maxV, tr, tl);
                        topright = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeBR[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 40) { /* 0220 */
                        bottomright = interpolateX(maxV, bl, br);
                        bottomleft = interpolateX(minV, bl, br);
                        topleft = interpolateX(minV, tl, tr);
                        topright = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeBR[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    }

                    /* 4th single pentagon cases */
                    else if (cval == 101) { /* 1211 */
                        rightbottom = interpolateX(maxV, br, tr);
                        topleft = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 69) { /* 1011 */
                        rightbottom = 1 - interpolateX(minV, tr, br);
                        topleft = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 149) { /* 2111 */
                        leftbottom = interpolateX(maxV, bl, tl);
                        topright = 1 - interpolateX(maxV, tr, tl);
                        edges.Add(isoBandEdgeLB[cval]);
                    } else if (cval == 21) { /* 0111 */
                        leftbottom = 1 - interpolateX(minV, tl, bl);
                        topright = interpolateX(minV, tl, tr);
                        edges.Add(isoBandEdgeLB[cval]);
                    } else if (cval == 86) { /* 1112 */
                        bottomright = 1 - interpolateX(maxV, br, bl);
                        lefttop = 1 - interpolateX(maxV, tl, bl);
                        edges.Add(isoBandEdgeBR[cval]);
                    } else if (cval == 84) { /* 1110 */
                        bottomright = interpolateX(minV, bl, br);
                        lefttop = interpolateX(minV, bl, tl);
                        edges.Add(isoBandEdgeBR[cval]);
                    } else if (cval == 89) { /* 1121 */
                        righttop = 1 - interpolateX(maxV, tr, br);
                        bottomleft = interpolateX(maxV, bl, br);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 81) { /* 1101 */
                        righttop = interpolateX(minV, br, tr);
                        bottomleft = 1 - interpolateX(minV, br, bl);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 96) { /* 1200 */
                        righttop = interpolateX(maxV, br, tr);
                        rightbottom = interpolateX(minV, br, tr);
                        lefttop = interpolateX(minV, bl, tl);
                        topleft = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 74) { /* 1022 */
                        righttop = 1 - interpolateX(minV, tr, br);
                        rightbottom = 1 - interpolateX(maxV, tr, br);
                        lefttop = 1 - interpolateX(maxV, tl, bl);
                        topleft = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 24) { /* 0120 */
                        righttop = 1 - interpolateX(maxV, tr, br);
                        bottomright = interpolateX(maxV, bl, br);
                        bottomleft = interpolateX(minV, bl, br);
                        topright = interpolateX(minV, tl, tr);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 146) { /* 2102 */
                        righttop = interpolateX(minV, br, tr);
                        bottomright = 1 - interpolateX(minV, br, bl);
                        bottomleft = 1 - interpolateX(maxV, br, bl);
                        topright = 1 - interpolateX(maxV, tr, tl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 6) { /* 0012 */
                        rightbottom = 1 - interpolateX(minV, tr, br);
                        bottomright = 1 - interpolateX(maxV, br, bl);
                        leftbottom = 1 - interpolateX(maxV, tl, bl);
                        lefttop = 1 - interpolateX(minV, tl, bl);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeBR[cval]);
                    } else if (cval == 164) { /* 2210 */
                        rightbottom = interpolateX(maxV, br, tr);
                        bottomright = interpolateX(minV, bl, br);
                        leftbottom = interpolateX(minV, bl, tl);
                        lefttop = interpolateX(maxV, bl, tl);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeBR[cval]);
                    } else if (cval == 129) { /* 2001 */
                        bottomleft = 1 - interpolateX(minV, br, bl);
                        leftbottom = interpolateX(maxV, bl, tl);
                        topleft = 1 - interpolateX(maxV, tr, tl);
                        topright = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeBL[cval]);
                        edges.Add(isoBandEdgeLB[cval]);
                    } else if (cval == 41) { /* 0221 */
                        bottomleft = interpolateX(maxV, bl, br);
                        leftbottom = 1 - interpolateX(minV, tl, bl);
                        topleft = interpolateX(minV, tl, tr);
                        topright = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeBL[cval]);
                        edges.Add(isoBandEdgeLB[cval]);
                    } else if (cval == 66) { /* 1002 */
                        bottomright = 1 - interpolateX(minV, br, bl);
                        bottomleft = 1 - interpolateX(maxV, br, bl);
                        lefttop = 1 - interpolateX(maxV, tl, bl);
                        topleft = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeBR[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 104) { /* 1220 */
                        bottomright = interpolateX(maxV, bl, br);
                        bottomleft = interpolateX(minV, bl, br);
                        lefttop = interpolateX(minV, bl, tl);
                        topleft = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeBL[cval]);
                        edges.Add(isoBandEdgeTL[cval]);
                    } else if (cval == 144) { /* 2100 */
                        righttop = interpolateX(minV, br, tr);
                        leftbottom = interpolateX(minV, bl, tl);
                        lefttop = interpolateX(maxV, bl, tl);
                        topright = 1 - interpolateX(maxV, tr, tl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 26) { /* 0122 */
                        righttop = 1 - interpolateX(maxV, tr, br);
                        leftbottom = 1 - interpolateX(maxV, tl, bl);
                        lefttop = 1 - interpolateX(minV, tl, bl);
                        topright = interpolateX(minV, tl, tr);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 36) { /* 0210 */
                        rightbottom = interpolateX(maxV, br, tr);
                        bottomright = interpolateX(minV, bl, br);
                        topleft = interpolateX(minV, tl, tr);
                        topright = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeBR[cval]);
                    } else if (cval == 134) { /* 2012 */
                        rightbottom = 1 - interpolateX(minV, tr, br);
                        bottomright = 1 - interpolateX(maxV, br, bl);
                        topleft = 1 - interpolateX(maxV, tr, tl);
                        topright = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeBR[cval]);
                    } else if (cval == 9) { /* 0021 */
                        righttop = 1 - interpolateX(minV, tr, br);
                        rightbottom = 1 - interpolateX(maxV, tr, br);
                        bottomleft = interpolateX(maxV, bl, br);
                        leftbottom = 1 - interpolateX(minV, tl, bl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 161) { /* 2201 */
                        righttop = interpolateX(maxV, br, tr);
                        rightbottom = interpolateX(minV, br, tr);
                        bottomleft = 1 - interpolateX(minV, br, bl);
                        leftbottom = interpolateX(maxV, bl, tl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                    }

                    /* 5th single hexagon cases */
                    else if (cval == 37) { /* 0211 */
                        rightbottom = interpolateX(maxV, br, tr);
                        leftbottom = 1 - interpolateX(minV, tl, bl);
                        topleft = interpolateX(minV, tl, tr);
                        topright = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeLB[cval]);
                    } else if (cval == 133) { /* 2011 */
                        rightbottom = 1 - interpolateX(minV, tr, br);
                        leftbottom = interpolateX(maxV, bl, tl);
                        topleft = 1 - interpolateX(maxV, tr, tl);
                        topright = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeLB[cval]);
                    } else if (cval == 148) { /* 2110 */
                        bottomright = interpolateX(minV, bl, br);
                        leftbottom = interpolateX(minV, bl, tl);
                        lefttop = interpolateX(maxV, bl, tl);
                        topright = 1 - interpolateX(maxV, tr, tl);
                        edges.Add(isoBandEdgeBR[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 22) { /* 0112 */
                        bottomright = 1 - interpolateX(maxV, br, bl);
                        leftbottom = 1 - interpolateX(maxV, tl, bl);
                        lefttop = 1 - interpolateX(minV, tl, bl);
                        topright = interpolateX(minV, tl, tr);
                        edges.Add(isoBandEdgeBR[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 82) { /* 1102 */
                        righttop = interpolateX(minV, br, tr);
                        bottomright = 1 - interpolateX(minV, br, bl);
                        bottomleft = 1 - interpolateX(maxV, br, bl);
                        lefttop = 1 - interpolateX(maxV, tl, bl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 88) { /* 1120 */
                        righttop = 1 - interpolateX(maxV, tr, br);
                        bottomright = interpolateX(maxV, bl, br);
                        bottomleft = interpolateX(minV, bl, br);
                        lefttop = interpolateX(minV, bl, tl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 73) { /* 1021 */
                        righttop = 1 - interpolateX(minV, tr, br);
                        rightbottom = 1 - interpolateX(maxV, tr, br);
                        bottomleft = interpolateX(maxV, bl, br);
                        topleft = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 97) { /* 1201 */
                        righttop = interpolateX(maxV, br, tr);
                        rightbottom = interpolateX(minV, br, tr);
                        bottomleft = 1 - interpolateX(minV, br, bl);
                        topleft = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                    } else if (cval == 145) { /* 2101 */
                        righttop = interpolateX(minV, br, tr);
                        bottomleft = 1 - interpolateX(minV, br, bl);
                        leftbottom = interpolateX(maxV, bl, tl);
                        topright = 1 - interpolateX(maxV, tr, tl);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeLB[cval]);
                    } else if (cval == 25) { /* 0121 */
                        righttop = 1 - interpolateX(maxV, tr, br);
                        bottomleft = interpolateX(maxV, bl, br);
                        leftbottom = 1 - interpolateX(minV, tl, bl);
                        topright = interpolateX(minV, tl, tr);
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeLB[cval]);
                    } else if (cval == 70) { /* 1012 */
                        rightbottom = 1 - interpolateX(minV, tr, br);
                        bottomright = 1 - interpolateX(maxV, br, bl);
                        lefttop = 1 - interpolateX(maxV, tl, bl);
                        topleft = 1 - interpolateX(minV, tr, tl);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeBR[cval]);
                    } else if (cval == 100) { /* 1210 */
                        rightbottom = interpolateX(maxV, br, tr);
                        bottomright = interpolateX(minV, bl, br);
                        lefttop = interpolateX(minV, bl, tl);
                        topleft = interpolateX(maxV, tl, tr);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeBR[cval]);
                    }

                    /* 8-sided cases */
                    else if (cval == 34) { /* 0202 || 2020 with flipped == 0 */
                        if (flipped == 0) {
                            righttop = 1 - interpolateX(minV, tr, br);
                            rightbottom = 1 - interpolateX(maxV, tr, br);
                            bottomright = interpolateX(maxV, bl, br);
                            bottomleft = interpolateX(minV, bl, br);
                            leftbottom = interpolateX(minV, bl, tl);
                            lefttop = interpolateX(maxV, bl, tl);
                            topleft = 1 - interpolateX(maxV, tr, tl);
                            topright = 1 - interpolateX(minV, tr, tl);
                        } else {
                            righttop = interpolateX(maxV, br, tr);
                            rightbottom = interpolateX(minV, br, tr);
                            bottomright = 1 - interpolateX(minV, br, bl);
                            bottomleft = 1 - interpolateX(maxV, br, bl);
                            leftbottom = 1 - interpolateX(maxV, tl, bl);
                            lefttop = 1 - interpolateX(minV, tl, bl);
                            topleft = interpolateX(minV, tl, tr);
                            topright = interpolateX(maxV, tl, tr);
                        }
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeLB[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 35) { /* flipped == 1 state for 0202, and 2020 with flipped == 4*/
                        if (flipped == 4) {
                            righttop = 1 - interpolateX(minV, tr, br);
                            rightbottom = 1 - interpolateX(maxV, tr, br);
                            bottomright = interpolateX(maxV, bl, br);
                            bottomleft = interpolateX(minV, bl, br);
                            leftbottom = interpolateX(minV, bl, tl);
                            lefttop = interpolateX(maxV, bl, tl);
                            topleft = 1 - interpolateX(maxV, tr, tl);
                            topright = 1 - interpolateX(minV, tr, tl);
                        } else {
                            righttop = interpolateX(maxV, br, tr);
                            rightbottom = interpolateX(minV, br, tr);
                            bottomright = 1 - interpolateX(minV, br, bl);
                            bottomleft = 1 - interpolateX(maxV, br, bl);
                            leftbottom = 1 - interpolateX(maxV, tl, bl);
                            lefttop = 1 - interpolateX(minV, tl, bl);
                            topleft = interpolateX(minV, tl, tr);
                            topright = interpolateX(maxV, tl, tr);
                        }
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 136) { /* 2020 || 0202 with flipped == 0 */
                        if (flipped == 0) {
                            righttop = interpolateX(maxV, br, tr);
                            rightbottom = interpolateX(minV, br, tr);
                            bottomright = 1 - interpolateX(minV, br, bl);
                            bottomleft = 1 - interpolateX(maxV, br, bl);
                            leftbottom = 1 - interpolateX(maxV, tl, bl);
                            lefttop = 1 - interpolateX(minV, tl, bl);
                            topleft = interpolateX(minV, tl, tr);
                            topright = interpolateX(maxV, tl, tr);
                        } else {
                            righttop = 1 - interpolateX(minV, tr, br);
                            rightbottom = 1 - interpolateX(maxV, tr, br);
                            bottomright = interpolateX(maxV, bl, br);
                            bottomleft = interpolateX(minV, bl, br);
                            leftbottom = interpolateX(minV, bl, tl);
                            lefttop = interpolateX(maxV, bl, tl);
                            topleft = 1 - interpolateX(maxV, tr, tl);
                            topright = 1 - interpolateX(minV, tr, tl);
                        }
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeLB[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    }

                    /* 6-sided polygon cases */
                    else if (cval == 153) { /* 0101 with flipped == 0 || 2121 with flipped == 2 */
                        if (flipped == 0) {
                            righttop = interpolateX(minV, br, tr);
                            bottomleft = 1 - interpolateX(minV, br, bl);
                            leftbottom = 1 - interpolateX(minV, tl, bl);
                            topright = interpolateX(minV, tl, tr);
                        } else {
                            righttop = 1 - interpolateX(maxV, tr, br);
                            bottomleft = interpolateX(maxV, bl, br);
                            leftbottom = interpolateX(maxV, bl, tl);
                            topright = 1 - interpolateX(maxV, tr, tl);
                        }
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 102) { /* 1010 with flipped == 0 || 1212 with flipped == 2 */
                        if (flipped == 0) {
                            rightbottom = 1 - interpolateX(minV, tr, br);
                            bottomright = interpolateX(minV, bl, br);
                            lefttop = interpolateX(minV, bl, tl);
                            topleft = 1 - interpolateX(minV, tr, tl);
                        } else {
                            rightbottom = interpolateX(maxV, br, tr);
                            bottomright = 1 - interpolateX(maxV, br, bl);
                            lefttop = 1 - interpolateX(maxV, tl, bl);
                            topleft = interpolateX(maxV, tl, tr);
                        }
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 155) { /* 0101 with flipped == 4 || 2121 with flipped == 1 */
                        if (flipped == 4) {
                            righttop = interpolateX(minV, br, tr);
                            bottomleft = 1 - interpolateX(minV, br, bl);
                            leftbottom = 1 - interpolateX(minV, tl, bl);
                            topright = interpolateX(minV, tl, tr);
                        } else {
                            righttop = 1 - interpolateX(maxV, tr, br);
                            bottomleft = interpolateX(maxV, bl, br);
                            leftbottom = interpolateX(maxV, bl, tl);
                            topright = 1 - interpolateX(maxV, tr, tl);
                        }
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeLB[cval]);
                    } else if (cval == 103) { /* 1010 with flipped == 4 || 1212 with flipped == 1 */
                        if (flipped == 4) {
                            rightbottom = 1 - interpolateX(minV, tr, br);
                            bottomright = interpolateX(minV, bl, br);
                            lefttop = interpolateX(minV, bl, tl);
                            topleft = 1 - interpolateX(minV, tr, tl);
                        } else {
                            rightbottom = interpolateX(maxV, br, tr);
                            bottomright = 1 - interpolateX(maxV, br, bl);
                            lefttop = 1 - interpolateX(maxV, tl, bl);
                            topleft = interpolateX(maxV, tl, tr);
                        }
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeBR[cval]);
                    }

                    /* 7-sided polygon cases */
                    else if (cval == 152) { /* 2120 with flipped == 2 || 0102 with flipped == 0 */
                        if (flipped == 0) {
                            righttop = interpolateX(minV, br, tr);
                            bottomright = 1 - interpolateX(minV, br, bl);
                            bottomleft = 1 - interpolateX(maxV, br, bl);
                            leftbottom = 1 - interpolateX(maxV, tl, bl);
                            lefttop = 1 - interpolateX(minV, tl, bl);
                            topright = interpolateX(minV, tl, tr);
                        } else {
                            righttop = 1 - interpolateX(maxV, tr, br);
                            bottomright = interpolateX(maxV, bl, br);
                            bottomleft = interpolateX(minV, bl, br);
                            leftbottom = interpolateX(minV, bl, tl);
                            lefttop = interpolateX(maxV, bl, tl);
                            topright = 1 - interpolateX(maxV, tr, tl);
                        }
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeBR[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 156) { /* 2120 with flipped == 1 || 0102 with flipped == 4 */
                        if (flipped == 4) {
                            righttop = interpolateX(minV, br, tr);
                            bottomright = 1 - interpolateX(minV, br, bl);
                            bottomleft = 1 - interpolateX(maxV, br, bl);
                            leftbottom = 1 - interpolateX(maxV, tl, bl);
                            lefttop = 1 - interpolateX(minV, tl, bl);
                            topright = interpolateX(minV, tl, tr);
                        } else {
                            righttop = 1 - interpolateX(maxV, tr, br);
                            bottomright = interpolateX(maxV, bl, br);
                            bottomleft = interpolateX(minV, bl, br);
                            leftbottom = interpolateX(minV, bl, tl);
                            lefttop = interpolateX(maxV, bl, tl);
                            topright = 1 - interpolateX(maxV, tr, tl);
                        }
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 137) { /* 2021 with flipped == 2 || 0201 with flipped == 0 */
                        if (flipped == 0) {
                            righttop = interpolateX(maxV, br, tr);
                            rightbottom = interpolateX(minV, br, tr);
                            bottomleft = 1 - interpolateX(minV, br, bl);
                            leftbottom = 1 - interpolateX(minV, tl, bl);
                            topleft = interpolateX(minV, tl, tr);
                            topright = interpolateX(maxV, tl, tr);
                        } else {
                            righttop = 1 - interpolateX(minV, tr, br);
                            rightbottom = 1 - interpolateX(maxV, tr, br);
                            bottomleft = interpolateX(maxV, bl, br);
                            leftbottom = interpolateX(maxV, bl, tl);
                            topleft = 1 - interpolateX(maxV, tr, tl);
                            topright = 1 - interpolateX(minV, tr, tl);
                        }
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 139) { /* 2021 with flipped == 1 || 0201 with flipped == 4 */
                        if (flipped == 4) {
                            righttop = interpolateX(maxV, br, tr);
                            rightbottom = interpolateX(minV, br, tr);
                            bottomleft = 1 - interpolateX(minV, br, bl);
                            leftbottom = 1 - interpolateX(minV, tl, bl);
                            topleft = interpolateX(minV, tl, tr);
                            topright = interpolateX(maxV, tl, tr);
                        } else {
                            righttop = 1 - interpolateX(minV, tr, br);
                            rightbottom = 1 - interpolateX(maxV, tr, br);
                            bottomleft = interpolateX(maxV, bl, br);
                            leftbottom = interpolateX(maxV, bl, tl);
                            topleft = 1 - interpolateX(maxV, tr, tl);
                            topright = 1 - interpolateX(minV, tr, tl);
                        }
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeLB[cval]);
                    } else if (cval == 98) { /* 1202 with flipped == 2 || 1020 with flipped == 0 */
                        if (flipped == 0) {
                            righttop = 1 - interpolateX(minV, tr, br);
                            rightbottom = 1 - interpolateX(maxV, tr, br);
                            bottomright = interpolateX(maxV, bl, br);
                            bottomleft = interpolateX(minV, bl, br);
                            lefttop = interpolateX(minV, bl, tl);
                            topleft = 1 - interpolateX(minV, tr, tl);
                        } else {
                            righttop = interpolateX(maxV, br, tr);
                            rightbottom = interpolateX(minV, br, tr);
                            bottomright = 1 - interpolateX(minV, br, bl);
                            bottomleft = 1 - interpolateX(maxV, br, bl);
                            lefttop = 1 - interpolateX(maxV, tl, bl);
                            topleft = interpolateX(maxV, tl, tr);
                        }
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 99) { /* 1202 with flipped == 1 || 1020 with flipped == 4 */
                        if (flipped == 4) {
                            righttop = 1 - interpolateX(minV, tr, br);
                            rightbottom = 1 - interpolateX(maxV, tr, br);
                            bottomright = interpolateX(maxV, bl, br);
                            bottomleft = interpolateX(minV, bl, br);
                            lefttop = interpolateX(minV, bl, tl);
                            topleft = 1 - interpolateX(minV, tr, tl);
                        } else {
                            righttop = interpolateX(maxV, br, tr);
                            rightbottom = interpolateX(minV, br, tr);
                            bottomright = 1 - interpolateX(minV, br, bl);
                            bottomleft = 1 - interpolateX(maxV, br, bl);
                            lefttop = 1 - interpolateX(maxV, tl, bl);
                            topleft = interpolateX(maxV, tl, tr);
                        }
                        edges.Add(isoBandEdgeRT[cval]);
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeBL[cval]);
                    } else if (cval == 38) { /* 0212 with flipped == 2 || 2010 with flipped == 0 */
                        if (flipped == 0) {
                            rightbottom = 1 - interpolateX(minV, tr, br);
                            bottomright = interpolateX(minV, bl, br);
                            leftbottom = interpolateX(minV, bl, tl);
                            lefttop = interpolateX(maxV, bl, tl);
                            topleft = 1 - interpolateX(maxV, tr, tl);
                            topright = 1 - interpolateX(minV, tr, tl);
                        } else {
                            rightbottom = interpolateX(maxV, br, tr);
                            bottomright = 1 - interpolateX(maxV, br, bl);
                            leftbottom = 1 - interpolateX(maxV, tl, bl);
                            lefttop = 1 - interpolateX(minV, tl, bl);
                            topleft = interpolateX(minV, tl, tr);
                            topright = interpolateX(maxV, tl, tr);
                        }
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeLB[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    } else if (cval == 39) { /* 0212 with flipped == 1 || 2010 with flipped == 4 */
                        if (flipped == 4) {
                            rightbottom = 1 - interpolateX(minV, tr, br);
                            bottomright = interpolateX(minV, bl, br);
                            leftbottom = interpolateX(minV, bl, tl);
                            lefttop = interpolateX(maxV, bl, tl);
                            topleft = 1 - interpolateX(maxV, tr, tl);
                            topright = 1 - interpolateX(minV, tr, tl);
                        } else {
                            rightbottom = interpolateX(maxV, br, tr);
                            bottomright = 1 - interpolateX(maxV, br, bl);
                            leftbottom = 1 - interpolateX(maxV, tl, bl);
                            lefttop = 1 - interpolateX(minV, tl, bl);
                            topleft = interpolateX(minV, tl, tr);
                            topright = interpolateX(maxV, tl, tr);
                        }
                        edges.Add(isoBandEdgeRB[cval]);
                        edges.Add(isoBandEdgeBR[cval]);
                        edges.Add(isoBandEdgeLT[cval]);
                    }

                    else if (cval == 85) {
                        righttop = 1;
                        rightbottom = 0;
                        bottomright = 1;
                        bottomleft = 0;
                        leftbottom = 0;
                        lefttop = 1;
                        topleft = 0;
                        topright = 1;
                    }

                    if (topleft < 0 || topleft > 1 || topright < 0 || topright > 1 || righttop < 0 || righttop > 1 || bottomright < 0 || bottomright > 1 || leftbottom < 0 || leftbottom > 1 || lefttop < 0 || lefttop > 1) {
                        Console.WriteLine(cval + " " + cval_real + " " + tl + "," + tr + "," + br + "," + bl + " " + flipped + " " + topleft + " " + topright + " " + righttop + " " + rightbottom + " " + bottomright + " " + bottomleft + " " + leftbottom + " " + lefttop);
                    }

                    BandGrid.cells[j][i] = new Cells();
                    BandGrid.cells[j][i].cval = cval;
                    BandGrid.cells[j][i].cval_real = cval_real;
                    BandGrid.cells[j][i].flipped = flipped;
                    BandGrid.cells[j][i].topleft = topleft;
                    BandGrid.cells[j][i].topright = topright;
                    BandGrid.cells[j][i].righttop = righttop;
                    BandGrid.cells[j][i].rightbottom = rightbottom;
                    BandGrid.cells[j][i].bottomright = bottomright;
                    BandGrid.cells[j][i].bottomleft = bottomleft;
                    BandGrid.cells[j][i].leftbottom = leftbottom;
                    BandGrid.cells[j][i].lefttop = lefttop;
                    BandGrid.cells[j][i].edges = edges;

                }
            }
        }

        return BandGrid;
    }

    private List<List<List<double>>>  BandGrid2AreaPaths(BandGrid grid)
    {
        List<List<List<double>>> areas = new List<List<List<double>>>();
        double area_idx = 0;
        int rows = grid.rows;
        int cols = grid.cols;
        List<List<double>> currentPolygon = new List<List<double>>();

        for (int j = 0; j < rows; j++)
        {
            for (int i = 0; i < cols; i++)
            {
                if ((grid.cells[j][i] != null) && (grid.cells[j][i].edges.Count > 0))
                {
                    /* trace back polygon path starting from this cell */
                    int o = 0,
                        x = i,
                        y = j;

                    Cells cell = grid.cells[j][i];
                    /* get start coordinates */
                    int cval = cell.cval;

                    XY prev = getStartXY(cell);
                    XY next = null;
                    int p = i;
                    int q = j;

                    if (prev != null)
                    {
                        currentPolygon.Add(new List<double> { prev.p[0] + p, prev.p[1] + q});
                        Console.WriteLine(cell);
                        Console.WriteLine("coords: " + (prev.p[0] + p) + " " + (prev.p[1] + q));
                    }           

                  do{
                    //Console.WriteLine(p + "," + q);
                    //Console.WriteLine(grid.cells[q][p]);
                    //Console.WriteLine(grid.cells[q][p].edges);
                    //Console.WriteLine("from : " + prev.x + " " + prev.y + " " + prev.o);

                    next = getExitXY(grid.cells[q][p], prev.x, prev.y, prev.o);
                    if(next != null){
                      //Console.WriteLine("coords: " + (next.p[0] + p) + " " + (next.p[1] + q));
                      currentPolygon.Add(new List<double> { next.p[0] + p, next.p[1] + q });
                      p += next.x;
                      q += next.y;
                      prev = next;
                    } else {
                      //Console.WriteLine("getExitXY() returned null!");
                      break;
                    }
                    //Console.WriteLine("to : " + next.x + " " + next.y + " " + next.o);
                    /* special case, where we've reached the grid boundaries */
                    if((q< 0) || (q >= rows) || (p< 0) || (p >= cols) || (grid.cells[q][p] == null )){
                      /* to create a closed path, we need to trace our way
                          arround the missing data, until we find an entry
                          point again
                      */

                      /* set back coordinates of current cell */
                      p -= next.x;
                      q -= next.y;

                      //Console.WriteLine("reached boundary at " + p + " " + q);

                      GridPath missing = traceOutOfGridPath(grid, p, q, next.x, next.y, next.o);
                      if(missing != null){
                        foreach(List<double> pp in missing.path)
                        {
                            //Console.WriteLine("coords: " + (pp[0]) + " " + (pp[1]));
                            currentPolygon.Add(pp);
                        }
                        p = missing.i;
                        q = missing.j;
                        //prev = missing;
                      } else {
                        break;
                      }
                      //Console.WriteLine(grid.cells[q][p]);
                    }
                  } while(( grid.cells[q][p] != null) && (grid.cells[q][p].edges.Count > 0));

              areas.Add(currentPolygon);
              //Console.WriteLine("next polygon");
              //Console.WriteLine(currentPolygon);
              currentPolygon = null;
              if(grid.cells[j][i].edges.Count > 0)
                i--;
        }}}
        return areas;
    }
    

    private GridPath traceOutOfGridPath(BandGrid grid, int i, int j, int d_x, int d_y, int d_o)
{
    Cells cell = grid.cells[j][i];
    int cval = cell.cval_real;
    int p = i + d_x,
        q = j + d_y;
    List<List<double>> path = new List<List<double>>();
    int rows = grid.rows;
    int cols = grid.cols;
    bool closed = false;

    while (!closed)
    {
        //Console.WriteLine("processing cell " + p + "," + q + " " + d_x + " " + d_y + " " + d_o);
        if ((grid.cells[q] == null) || (grid.cells[q][p] == null))
        {
            //Console.WriteLine("which is undefined");
            /* we can't move on, so we have to change direction to proceed further */

            /* go back to previous cell */
            q -= d_y;
            p -= d_x;
            cell = grid.cells[q][p];
            cval = cell.cval_real;

            /* check where we've left defined cells of the grid... */
            if (d_y == -1)
            { /* we came from top */
                if (d_o == 0)
                {  /* exit left */
                    if ((cval & Node3) >  0)
                    { /* lower left node is within range, so we move left */
                        path.Add( new List<double> { p, q });
                        d_x = -1;
                        d_y = 0;
                        d_o = 0;
                    }
                    else if ((cval & Node2) > 0)
                    { /* lower right node is within range, so we move right */
                        path.Add(new List<double> { p + 1, q });
                        d_x = 1;
                        d_y = 0;
                        d_o = 0;
                    }
                    else { /* close the path */
                        path.Add(new List<double> { p + cell.bottomright, q });
                        d_x = 0;
                        d_y = 1;
                        d_o = 1;
                        closed = true;
                        break;
                    }
                }
                else {
                    if ((cval & Node3) > 0)
                    {
                        path.Add(new List<double> { p, q });
                        d_x = -1;
                        d_y = 0;
                        d_o = 0;
                    }
                    else if ((cval & Node2) > 0)
                    {
                        path.Add(new List<double> { p + cell.bottomright, q });
                        d_x = 0;
                        d_y = 1;
                        d_o = 1;
                        closed = true;
                        break;
                    }
                    else {
                        path.Add(new List<double> { p + cell.bottomleft, q });
                        d_x = 0;
                        d_y = 1;
                        d_o = 0;
                        closed = true;
                        break;
                    }
                }
            }
            else if (d_y == 1)
            { /* we came from bottom */
              //Console.WriteLine("we came from bottom and hit a non-existing cell " + (p + d_x) + "," + (q + d_y) + "!");
                if (d_o == 0)
                { /* exit left */
                    if ( (cval & Node1) > 0)
                    { /* top right node is within range, so we move right */
                        path.Add( new List<double>{p + 1, q + 1});
                        d_x = 1;
                        d_y = 0;
                        d_o = 1;
                    }
                    else if (!((cval & Node0) > 0))
                    { /* found entry within same cell */
                        path.Add( new List<double>{p + cell.topright, q + 1});
                        d_x = 0;
                        d_y = -1;
                        d_o = 1;
                        closed = true;
                        //Console.WriteLine("found entry from bottom at " + p + "," + q);
                        break;
                    }
                    else {
                        path.Add( new List<double>{p + cell.topleft, q + 1});
                        d_x = 0;
                        d_y = -1;
                        d_o = 0;
                        closed = true;
                        break;
                    }
                }
                else {
                    if ((cval & Node1) > 0)
                    {
                        path.Add( new List<double>{p + 1, q + 1});
                        d_x = 1;
                        d_y = 0;
                        d_o = 1;
                    }
                    else { /* move right */
                        path.Add( new List<double>{p + 1, q + 1});
                        d_x = 1;
                        d_y = 0;
                        d_o = 1;
                        //Console.WriteLine("wtf");
                        //break;
                    }
                }
            }
            else if (d_x == -1)
            { /* we came from right */
              //Console.WriteLine("we came from right and hit a non-existing cell at " + (p + d_x) + "," + (q + d_y) + "!");
                if (d_o == 0)
                {
                    //Console.WriteLine("continue at bottom");
                    if ((cval & Node0)>0)
                    {
                        path.Add( new List<double>{p, q + 1});
                        d_x = 0;
                        d_y = 1;
                        d_o = 0;
                        //Console.WriteLine("moving upwards to " + (p + d_x) + "," + (q + d_y) + "!");
                    }
                    else if (!((cval & Node3) > 0))
                    { /* there has to be an entry into the regular grid again! */
                      //Console.WriteLine("exiting top");
                        path.Add( new List<double>{p, q + cell.lefttop});
                        d_x = 1;
                        d_y = 0;
                        d_o = 1;
                        closed = true;
                        break;
                    }
                    else {
                        //Console.WriteLine("exiting bottom");
                        path.Add( new List<double>{p, q + cell.leftbottom});
                        d_x = 1;
                        d_y = 0;
                        d_o = 0;
                        closed = true;
                        break;
                    }
                }
                else {
                    //Console.WriteLine("continue at top");
                    if ((cval & Node0) > 0)
                    {
                        path.Add( new List<double>{p, q + 1});
                        d_x = 0;
                        d_y = 1;
                        d_o = 0;
                        //Console.WriteLine("moving upwards to " + (p + d_x) + "," + (q + d_y) + "!");
                    }
                    else { /* */
                        Console.WriteLine("wtf");
                        break;
                    }
                }
            }
            else if (d_x == 1)
            { /* we came from left */
              //Console.WriteLine("we came from left and hit a non-existing cell " + (p + d_x) + "," + (q + d_y) + "!");
                if (d_o == 0)
                { /* exit bottom */
                    if ((cval & Node2) > 0)
                    {
                        path.Add( new List<double>{p + 1, q});
                        d_x = 0;
                        d_y = -1;
                        d_o = 1;
                    }
                    else {
                        path.Add( new List<double>{p + 1, q + cell.rightbottom});
                        d_x = -1;
                        d_y = 0;
                        d_o = 0;
                        closed = true;
                        break;
                    }
                }
                else { /* exit top */
                    if ((cval & Node2) > 0)
                    {
                        path.Add( new List<double>{p + 1, q});
                        d_x = 0;
                        d_y = -1;
                        d_o = 1;
                    }
                    else if (!((cval & Node1) > 0))
                    {
                        path.Add( new List<double>{p + 1, q + cell.rightbottom});
                        d_x = -1;
                        d_y = 0;
                        d_o = 0;
                        closed = true;
                        break;
                    }
                    else {
                        path.Add( new List<double>{p + 1, q + cell.righttop});
                        d_x = -1;
                        d_y = 0;
                        d_o = 1;
                        break;
                    }
                }
            }
            else { /* we came from the same cell */
                Console.WriteLine("we came from nowhere!");
                break;
            }

        }
        else { /* try to find an entry into the regular grid again! */
            cell = grid.cells[q][p];
            cval = cell.cval_real;
            //Console.WriteLine("which is defined");

            if (d_x == -1)
            {
                if (d_o == 0)
                {
                    /* try to go downwards */
                    if ((grid.cells[q - 1] != null) && (grid.cells[q - 1][p] != null))
                    {
                        d_x = 0;
                        d_y = -1;
                        d_o = 1;
                    }
                    else if ((cval & Node3) > 0)
                    { /* proceed searching in x-direction */
                      //Console.WriteLine("proceeding in x-direction!");
                        path.Add( new List<double>{p, q});
                    }
                    else { /* we must have found an entry into the regular grid */
                        path.Add( new List<double>{p + cell.bottomright, q});
                        d_x = 0;
                        d_y = 1;
                        d_o = 1;
                        closed = true;
                        //Console.WriteLine("found entry from bottom at " + p + "," + q);
                        break;
                    }
                }
                else {
                    if ((cval & Node0) > 0)
                    { /* proceed searchin in x-direction */
                        Console.WriteLine("proceeding in x-direction!");
                    }
                    else { /* we must have found an entry into the regular grid */
                        Console.WriteLine("found entry from top at " + p + "," + q);
                        break;
                    }
                }
            }
            else if (d_x == 1)
            {
                if (d_o == 0)
                {
                    Console.WriteLine("wtf");
                    break;
                }
                else {
                    /* try to go upwards */
                    if ((grid.cells[q + 1] != null) && ( grid.cells[q + 1][p] != null))
                    {
                        d_x = 0;
                        d_y = 1;
                        d_o = 0;
                    }
                    else if ((cval & Node1) >0 )
                    {
                        path.Add( new List<double>{p + 1, q + 1});
                        d_x = 1;
                        d_y = 0;
                        d_o = 1;
                    }
                    else { /* found an entry point into regular grid! */
                        path.Add( new List<double>{p + cell.topleft, q + 1});
                        d_x = 0;
                        d_y = -1;
                        d_o = 0;
                        closed = true;
                        //Console.WriteLine("found entry from bottom at " + p + "," + q);
                        break;
                    }
                }
            }
            else if (d_y == -1)
            {
                if (d_o == 1)
                {
                    /* try to go right */
                    if (grid.cells[q][p + 1] != null)
                    {
                        d_x = 1;
                        d_y = 0;
                        d_o = 1;
                    }
                    else if ((cval & Node2 ) > 0)
                    {
                        path.Add( new List<double>{p + 1, q});
                        d_x = 0;
                        d_y = -1;
                        d_o = 1;
                    }
                    else { /* found entry into regular grid! */
                        path.Add( new List<double>{p + 1, q + cell.righttop});
                        d_x = -1;
                        d_y = 0;
                        d_o = 1;
                        closed = true;
                        //Console.WriteLine("found entry from top at " + p + "," + q);
                        break;
                    }
                }
                else {
                    Console.WriteLine("wtf");
                    break;
                }
            }
            else if (d_y == 1)
            {
                if (d_o == 0)
                {
                    //Console.WriteLine("we came from bottom left and proceed to the left");
                    /* try to go left */
                    if (grid.cells[q][p - 1] != null)
                    {
                        d_x = -1;
                        d_y = 0;
                        d_o = 0;
                    }
                    else if ((cval & Node0) > 0)
                    {
                        path.Add( new List<double>{p, q + 1});
                        d_x = 0;
                        d_y = 1;
                        d_o = 0;
                    }
                    else { /* found an entry point into regular grid! */
                        path.Add( new List<double>{p, q + cell.leftbottom});
                        d_x = 1;
                        d_y = 0;
                        d_o = 0;
                        closed = true;
                        //Console.WriteLine("found entry from bottom at " + p + "," + q);
                        break;
                    }
                }
                else {
                    //Console.WriteLine("we came from bottom right and proceed to the right");
                    Console.WriteLine("wtf");
                    break;
                }
            }
            else {
                Console.WriteLine("where did we came from???");
                break;
            }

        }

        p += d_x;
        q += d_y;
        //Console.WriteLine("going on to  " + p + "," + q + " via " + d_x + " " + d_y + " " + d_o);

        if ((p == i) && (q == j))
        { /* bail out, once we've closed a circle path */
            break;
        }

    }

    //Console.WriteLine("exit with " + p + "," + q + " " + d_x + " " + d_y + " " + d_o);
    return new GridPath(path, p, q, d_x, d_y,  d_o );
}

    private void deleteEdge(Cells cell, int edgeIdx)
    {
        cell.edges.RemoveAt(edgeIdx);
    }

    private XY getStartXY(Cells cell)
    {

        if (cell.edges.Count > 0)
        {
            int e = cell.edges[cell.edges.Count - 1];
            //Console.WriteLine("starting with edge " + e);
            int cval = cell.cval_real;
            switch (e)
            {
                case 0:
                    if ((cval &Node1) > 0 )
                    { /* node 1 within range */
                        return new XY( new double[2] { 1, cell.righttop },-1, 0,1);
                    }
                    else { /* node 1 below or above threshold */
                        return new XY( new double[2] { cell.topleft, 1 },0, -1,0);
                    }
                case 1:
                    if ((cval & Node2) > 0 )
                    {
                        return new XY( new double[2]{cell.topleft, 1},0, -1,0);
                    }
                    else {
                        return new XY( new double[2]{1, cell.rightbottom},-1, 0,0);
                    }
                case 2:
                    if ((cval & Node2) > 0 )
                    {
                        return new XY( new double[2]{cell.bottomright, 0},0, 1,1);
                    }
                    else {
                        return new XY( new double[2]{cell.topleft, 1},0, -1,0);
                    }
                case 3:
                    if ((cval & Node3) > 0 )
                    {
                        return new XY( new double[2]{cell.topleft, 1},0, -1,0);
                    }
                    else {
                        return new XY( new double[2]{cell.bottomleft, 0},0, 1,0);
                    }
                case 4:
                    if ((cval &Node1) > 0 )
                    {
                        return new XY( new double[2]{1, cell.righttop},-1, 0,1);
                    }
                    else {
                        return new XY( new double[2]{cell.topright, 1},0, -1,1);
                    }
                case 5:
                    if ((cval & Node2) > 0 )
                    {
                        return new XY( new double[2]{cell.topright, 1},0, -1,1);
                    }
                    else {
                        return new XY( new double[2]{1, cell.rightbottom},-1, 0,0);
                    }
                case 6:
                    if ((cval & Node2) > 0 )
                    {
                        return new XY( new double[2]{cell.bottomright, 0},0, 1,1);
                    }
                    else {
                        return new XY( new double[2]{cell.topright, 1},0, -1,1);
                    }
                case 7:
                    if ((cval & Node3) > 0 )
                    {
                        return new XY( new double[2]{cell.topright, 1},0, -1,1);
                    }
                    else {
                        return new XY( new double[2]{cell.bottomleft, 0},0, 1,0);
                    }
                case 8:
                    if ((cval & Node2) > 0)
                    {
                        return new XY( new double[2]{cell.bottomright, 0},0, 1,1);
                    }
                    else {
                        return new XY( new double[2]{1, cell.righttop},-1, 0,1);
                    }
                case 9:
                    if ((cval & Node3) > 0 )
                    {
                        return new XY( new double[2]{1, cell.righttop},-1, 0,1);
                    }
                    else {
                        return new XY( new double[2]{cell.bottomleft, 0},0, 1,0);
                    }
                case 10:
                    if ((cval & Node3) > 0 )
                    {
                        return new XY( new double[2]{0, cell.leftbottom},1, 0,0);
                    }
                    else {
                        return new XY( new double[2]{1, cell.righttop},-1, 0,1);
                    }
                case 11:
                    if ((cval & Node0) > 0 )
                    {
                        return new XY( new double[2]{1, cell.righttop},-1, 0,1);
                    }
                    else {
                        return new XY( new double[2]{0, cell.lefttop},1, 0,1);
                    }
                case 12:
                    if ((cval & Node2) > 0 )
                    {
                        return new XY( new double[2]{cell.bottomright, 0},0, 1,1);
                    }
                    else {
                        return new XY( new double[2]{1, cell.rightbottom},-1, 0,0);
                    }
                case 13:
                    if ((cval & Node3) > 0 )
                    {
                        return new XY( new double[2]{1, cell.rightbottom},-1, 0,0);
                    }
                    else {
                        return new XY( new double[2]{cell.bottomleft, 0},0, 1,0);
                    }
                case 14:
                    if ((cval & Node3) > 0 )
                    {
                        return new XY( new double[2]{0, cell.leftbottom},1, 0,0);
                    }
                    else {
                        return new XY( new double[2]{1, cell.rightbottom},-1, 0,0);
                    }
                case 15:
                    if ((cval & Node0) > 0 )
                    {
                        return new XY( new double[2]{1, cell.rightbottom},-1, 0,0);
                    }
                    else {
                        return new XY( new double[2]{0, cell.lefttop},1, 0,1);
                    }
                case 16:
                    if ((cval & Node2) > 0 )
                    {
                        return new XY( new double[2]{cell.bottomright, 0},0, 1,1);
                    }
                    else {
                        return new XY( new double[2]{0, cell.leftbottom},1, 0,0);
                    }
                case 17:
                    if ((cval & Node0) > 0 )
                    {
                        return new XY( new double[2]{cell.bottomright, 0},0, 1,1);
                    }
                    else {
                        return new XY( new double[2]{0, cell.lefttop},1, 0,1);
                    }
                case 18:
                    if ((cval & Node3) > 0 )
                    {
                        return new XY( new double[2]{0, cell.leftbottom},1, 0,0);
                    }
                    else {
                        return new XY( new double[2]{cell.bottomleft, 0},0, 1,0);
                    }
                case 19:
                    if ((cval & Node0) > 0 )
                    {
                        return new XY( new double[2]{cell.bottomleft, 0},0, 1,0);
                    }
                    else {
                        return new XY( new double[2]{0, cell.lefttop},1, 0,1);
                    }
                case 20:
                    if ((cval & Node0) > 0 )
                    {
                        return new XY( new double[2]{cell.topleft, 1},0, -1,0);
                    }
                    else {
                        return new XY( new double[2]{0, cell.leftbottom},1, 0,0);
                    }
                case 21:
                    if ((cval &Node1) > 0 )
                    {
                        return new XY( new double[2]{0, cell.leftbottom},1, 0,0);
                    }
                    else {
                        return new XY( new double[2]{cell.topright, 1},0, -1,1);
                    }
                case 22:
                    if ((cval & Node0) > 0 )
                    {
                        return new XY( new double[2]{cell.topleft, 1},0, -1,0);
                    }
                    else {
                        return new XY( new double[2]{0, cell.lefttop},1, 0,1);
                    }
                case 23:
                    if ((cval &Node1) > 0 )
                    {
                        return new XY( new double[2]{0, cell.lefttop},1, 0,1);
                    }
                    else {
                        return new XY( new double[2]{cell.topright, 1},0, -1,1);
                    }
                default:
                    Console.WriteLine("edge index out of range!");
                    Console.WriteLine(cell);
                    break;
            }
        }

        return null;
    }

    private XY getExitXY(Cells cell, double x, double y,double o)
    {

        int e, id_x, d_x, d_y, cval;
        x = y = e = id_x = d_x = d_y = cval = cell.cval;

        int? d_o = null;

        switch ((int)x)
        {
            case -1:
                switch ((int)o)
                {
                    case 0:
                        e = isoBandEdgeRB[cval];
                        d_x = isoBandNextXRB[cval];
                        d_y = isoBandNextYRB[cval];
                        d_o = isoBandNextORB[cval];
                        break;
                    default:
                        e = isoBandEdgeRT[cval];
                        d_x = isoBandNextXRT[cval];
                        d_y = isoBandNextYRT[cval];
                        d_o = isoBandNextORT[cval];
                        break;
                };
                break;
            case 1:
                switch ((int)o)
                {
                    case 0:
                        e = isoBandEdgeLB[cval];
                        d_x = isoBandNextXLB[cval];
                        d_y = isoBandNextYLB[cval];
                        d_o = isoBandNextOLB[cval];
                        break;
                    default:
                        e = isoBandEdgeLT[cval];
                        d_x = isoBandNextXLT[cval];
                        d_y = isoBandNextYLT[cval];
                        d_o = isoBandNextOLT[cval];
                        break;
                };
                break;
            default:
                switch ((int)y)
                {
                    case -1:
                        switch ((int)o)
                        {
                            case 0:
                                e = isoBandEdgeTL[cval];
                                d_x = isoBandNextXTL[cval];
                                d_y = isoBandNextYTL[cval];
                                d_o = isoBandNextOTL[cval];
                                break;
                            default:
                                e = isoBandEdgeTR[cval];
                                d_x = isoBandNextXTR[cval];
                                d_y = isoBandNextYTR[cval];
                                d_o = isoBandNextOTR[cval];
                                break;
                        };
                        break;
                    case 1:
                        switch ((int)o)
                        {
                            case 0:
                                e = isoBandEdgeBL[cval];
                                d_x = isoBandNextXBL[cval];
                                d_y = isoBandNextYBL[cval];
                                d_o = isoBandNextOBL[cval];
                                break;
                            default:
                                e = isoBandEdgeBR[cval];
                                d_x = isoBandNextXBR[cval];
                                d_y = isoBandNextYBR[cval];
                                d_o = isoBandNextOBR[cval];
                                break;
                        };
                        break;
                    default: break;
                };
                break;
        }

        id_x = cell.edges.IndexOf(e);
        if ( cell.edges[id_x] != null)
        {
            deleteEdge(cell, id_x);
        }
        else {
            //Console.WriteLine("wrong edges...");
            //Console.WriteLine(x + " " + y + " " + o);
            //Console.WriteLine(cell);
            return null;
        }

        cval = cell.cval_real;

        switch (e)
        {
            case 0:
                if ((cval &Node1) > 0 )
                { /* node 1 within range */
                    x = cell.topleft;
                    y = 1;
                }
                else { /* node 1 below or above threshold */
                    x = 1;
                    y = cell.righttop;
                }
                break;
            case 1:
                if ((cval & Node2) > 0 )
                {
                    x = 1;
                    y = cell.rightbottom;
                }
                else {
                    x = cell.topleft;
                    y = 1;
                }
                break;
            case 2:
                if ((cval & Node2) > 0 )
                {
                    x = cell.topleft;
                    y = 1;
                }
                else {
                    x = cell.bottomright;
                    y = 0;
                }
                break;
            case 3:
                if ((cval & Node3) > 0 )
                {
                    x = cell.bottomleft;
                    y = 0;
                }
                else {
                    x = cell.topleft;
                    y = 1;
                }
                break;
            case 4:
                if ((cval &Node1) > 0 )
                {
                    x = cell.topright;
                    y = 1;
                }
                else {
                    x = 1;
                    y = cell.righttop;
                }
                break;
            case 5:
                if ((cval & Node2) > 0 )
                {
                    x = 1;
                    y = cell.rightbottom;
                }
                else {
                    x = cell.topright;
                    y = 1;
                }
                break;
            case 6:
                if ((cval & Node2) > 0 )
                {
                    x = cell.topright;
                    y = 1;
                }
                else {
                    x = cell.bottomright;
                    y = 0;
                }
                break;
            case 7:
                if ((cval & Node3) > 0 )
                {
                    x = cell.bottomleft;
                    y = 0;
                }
                else {
                    x = cell.topright;
                    y = 1;
                }
                break;
            case 8:
                if ((cval & Node2) > 0 )
                {
                    x = 1;
                    y = cell.righttop;
                }
                else {
                    x = cell.bottomright;
                    y = 0;
                }
                break;
            case 9:
                if ((cval & Node3) > 0 )
                {
                    x = cell.bottomleft;
                    y = 0;
                }
                else {
                    x = 1;
                    y = cell.righttop;
                }
                break;
            case 10:
                if ((cval & Node3) > 0 )
                {
                    x = 1;
                    y = cell.righttop;
                }
                else {
                    x = 0;
                    y = cell.leftbottom;
                }
                break;
            case 11:
                if ((cval & Node0) > 0 )
                {
                    x = 0;
                    y = cell.lefttop;
                }
                else {
                    x = 1;
                    y = cell.righttop;
                }
                break;
            case 12:
                if ((cval & Node2) > 0 )
                {
                    x = 1;
                    y = cell.rightbottom;
                }
                else {
                    x = cell.bottomright;
                    y = 0;
                }
                break;
            case 13:
                if ((cval & Node3) > 0 )
                {
                    x = cell.bottomleft;
                    y = 0;
                }
                else {
                    x = 1;
                    y = cell.rightbottom;
                }
                break;
            case 14:
                if ((cval & Node3) > 0 )
                {
                    x = 1;
                    y = cell.rightbottom;
                }
                else {
                    x = 0;
                    y = cell.leftbottom;
                }
                break;
            case 15:
                if ((cval & Node0) > 0 )
                {
                    x = 0;
                    y = cell.lefttop;
                }
                else {
                    x = 1;
                    y = cell.rightbottom;
                }
                break;
            case 16:
                if ((cval & Node2) > 0 )
                {
                    x = 0;
                    y = cell.leftbottom;
                }
                else {
                    x = cell.bottomright;
                    y = 0;
                }
                break;
            case 17:
                if ((cval & Node0) > 0 )
                {
                    x = 0;
                    y = cell.lefttop;
                }
                else {
                    x = cell.bottomright;
                    y = 0;
                }
                break;
            case 18:
                if ((cval & Node3) > 0 )
                {
                    x = cell.bottomleft;
                    y = 0;
                }
                else {
                    x = 0;
                    y = cell.leftbottom;
                }
                break;
            case 19:
                if ((cval & Node0) > 0 )
                {
                    x = 0;
                    y = cell.lefttop;
                }
                else {
                    x = cell.bottomleft;
                    y = 0;
                }
                break;
            case 20:
                if ((cval & Node0) > 0 )
                {
                    x = 0;
                    y = cell.leftbottom;
                }
                else {
                    x = cell.topleft;
                    y = 1;
                }
                break;
            case 21:
                if ((cval &Node1) > 0 )
                {
                    x = cell.topright;
                    y = 1;
                }
                else {
                    x = 0;
                    y = cell.leftbottom;
                }
                break;
            case 22:
                if ((cval & Node0) > 0 )
                {
                    x = 0;
                    y = cell.lefttop;
                }
                else {
                    x = cell.topleft;
                    y = 1;
                }
                break;
            case 23:
                if ((cval &Node1) > 0 )
                {
                    x = cell.topright;
                    y = 1;
                }
                else {
                    x = 0;
                    y = cell.lefttop;
                }
                break;
            default:
                Console.WriteLine("edge index out of range!");
                Console.WriteLine(cell);
                return null;
        }

        //if (( x == null) || ( y == null) || ( d_x == null) || (typeof d_y == 'undefined') || (d_o == null))
        //{
        //    Console.WriteLine("undefined value!");
        //    Console.WriteLine(cell);
        //    Console.WriteLine(x + " " + y + " " + d_x + " " + d_y + " " + d_o);
        //}
        return new XY( new double[2]{x, y},d_x, d_y,d_o ?? 0);
    }

    private List<List<List<double>>> BandGrid2Areas(BandGrid grid)
    {
        List<List<List<double>>> areas = new List<List<List<double>>>();
        int rows = grid.rows;
        int cols = grid.cols;

        foreach(Cells[] g in grid.cells){
            foreach(Cells gg in g){
                if (gg != null)
                {
                    object a = polygon_table[gg.cval](gg);

                    if (a is List<List<List<double>>>)
                    {

                        foreach (List<List<double>> aa in (List < List < List < double >>> )a) {
                            foreach (List<double> aaa in aa)
                            {
                                aaa[0] += g.IndexOf(x => x == gg);
                                aaa[1] += grid.cells.IndexOf(x => x == g);
                            }

                            areas.Add(aa);
                        }
                    }else if(a is List<List<double>>)
                    {
                        foreach (List<double> aa in (List < List < double >>)a)
                        {
                            aa[0] += g.IndexOf(x => x == gg);
                            aa[1] += grid.cells.IndexOf(x => x == g);
                        }
                        areas.Add((List<List<double>>)a);
                    }
                    else {
                            Console.WriteLine("bandcell polygon with malformed coordinates");

                    }

                }
            }
        }

        return areas;
}
}