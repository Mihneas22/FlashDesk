using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Repository
{
    public interface IOcr
    {
        Task<string> RecognizeLatexAsync(byte[] imageBytes);
    }
}
