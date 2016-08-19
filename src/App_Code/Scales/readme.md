Linear Scales in C# like d3.scale.linear
========================================

This is an experiment to get linear scales in C# similar to the way d3.js defines and uses them.

In d3.js you can define a functor (borrowed from [Scott Murray's tutorial on scales](http://alignedleft.com/tutorials/d3/scales)):

```javascript
  var scale = d3.scale.linear()
                      .domain([100, 500])
                      .range([10, 350]);                      
```

to create a conversion function:

```
  scale(100);  //Returns 10
  scale(300);  //Returns 180
  scale(500);  //Returns 350
```

Can we do something similar in C#?
----------------------------------

Yes!

```    
  scale.Conversion linscale = new scale.Linear()
    .domain(100f, 200f)
    .range(-1.0f, 1.0f);
    
  linscale(100f);   //Returns -1.0
  linscale(150f);   //Returns 0
  linscale(200f);   //Returns 1.0
```

Thoughts
--------

I had the idea for this while working on a Unity3D project and found myself missing the simple 
linear scales I use in d3 projects.  I briefly looked for existing C# libraries of similar style, 
but couldn't find one.  It seemed like the style of passing functors (especially with closures to capture 
the conversion state) was natural to d3 and javascript, but somewhat unnatural to the C# idiom.

This is just a quick experiment to show it can be done.  I'm not sure if the language could be bent further
to match d3's semantics.  There may already be C# libraries that do this, but if not, maybe this
serves as an example of how idioms from one language can be applied in another.
