using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User.RegisterUser
{
    public record RegisterUserResponse(bool Flag, string message = null!);
}
