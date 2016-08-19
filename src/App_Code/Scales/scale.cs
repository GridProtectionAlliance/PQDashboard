// Linear Scales in C# like d3.scale.linear
// see https://github.com/mbostock/d3/wiki/Quantitative-Scales:
// var scale = d3.scale.linear()
//                     .domain([100, 500])
//                     .range([10, 350]);
using System;
using System.Linq;

namespace scale
{
    delegate double Conversion(double x);

    class Linear
    {
        public Conversion m_conversion;
        private double[] m_domainValues;
        private double[] m_rangeValues;

        public Linear domain(params double[] domainValues)
        {
            m_domainValues = domainValues;
            return this;
        }

        // assumption: has to be called last.
        public Conversion range(params double[] rangeValues)
        {
            m_rangeValues = rangeValues;
            return getConversion();
        }

        // this is a little different than d3's invocation.  maybe a different way?
        public Conversion getConversion()
        {
            m_conversion = x =>
            {
                if (x <= m_domainValues.First())
                    return m_rangeValues.First();

                if (x >= m_domainValues.Last())
                    return m_rangeValues.Last();

                for (int i = 0, j = 1; j < m_domainValues.Length; i++, j++)
                {
                    double dmin = m_domainValues[i];
                    double dmax = m_domainValues[j];

                    if (dmin <= x && x <= dmax)
                    {
                        double rmin = m_rangeValues[i];
                        double rmax = m_rangeValues[j];
                        return (((x - dmin) / (dmax - dmin)) * (rmax - rmin)) + rmin;
                    }
                }

                return double.NaN;
            };

            return m_conversion;
        }
    }
}

namespace Example
{
    class ScaleExample
    {
        static void Main()
        {
            Console.WriteLine("Ex: We want to map screen coords [100,200] to the range [-1,1]");

            scale.Conversion linscale = new scale.Linear()
              .domain(100f, 200f)
              .range(-1.0f, 1.0f);

            float[] someScreenPoints = new float[] { 100f, 125f, 150f, 175f, 200f };

            foreach (float screenPoint in someScreenPoints)
            {
                Console.WriteLine("screen value '{0}' to range: '{1}'", screenPoint, linscale(screenPoint));
            }
        }
    }
}