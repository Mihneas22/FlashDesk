using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User.LoginUser
{
    public record LoginUserResponse(bool Flag, string message = null!,string token = null!);
}
