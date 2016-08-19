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
                int i = 0;
                int j = m_domainValues.Length - 1;
                double di = m_domainValues[i];
                double dj = m_domainValues[j];

                while (j - i > 1)
                {
                    int mid = (i + j) / 2;
                    double dmid = m_domainValues[mid];

                    if ((di < dmid && x <= dmid) || (di > dmid && x >= dmid))
                    {
                        j = mid;
                        dj = dmid;
                    }
                    else
                    {
                        i = mid;
                        di = dmid;
                    }
                }

                if (di == dj)
                    return m_rangeValues[i];

                double ri = m_rangeValues[i];
                double rj = m_rangeValues[j];
                return (((x - di) / (dj - di)) * (rj - ri)) + ri;
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