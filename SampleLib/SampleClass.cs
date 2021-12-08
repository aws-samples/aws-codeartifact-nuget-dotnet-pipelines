using System;

namespace SampleOrg.SampleLib
{
    public class SampleClass
    {
        public void SayHello()
        {
            Console.WriteLine("Hello from SampleLib!");
            Console.WriteLine("If you are reading this message, then you have " +
                              "restored the SampleLib NuGet package from your " +
                              "private package feed hosted in your new " +
                              "CodeArtifact repository.");
        }
    }
}
