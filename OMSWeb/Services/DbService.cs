using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OMSWeb.Models;
using OMSWeb.Models.Tracks;
using OMSWeb.Repositories;
using OMSWeb.Models.Entities;

namespace OMSWeb.Services
{
    public class DbService
    {
        private readonly DbVersionRepository _dbVersionRepository;

        public DbService(DbVersionRepository _dbVersionRepository)
        {
            this._dbVersionRepository = _dbVersionRepository;
        }

        public DbVersionEntity GetCurrentMap()
        {
            return _dbVersionRepository.QueryCurrentMap();
        }
    }
}
