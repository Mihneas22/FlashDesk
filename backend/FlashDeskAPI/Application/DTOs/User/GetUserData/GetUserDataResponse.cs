using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.User.GetUserData
{
    public record GetUserDataResponse(bool Flag, string message = null!, Domain.Models.User userData = null!);
}
