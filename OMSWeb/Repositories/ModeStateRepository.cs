using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using Microsoft.Extensions.Configuration;
using Npgsql;
using OMSWeb.Models.Entities;
using OMSWeb.Models.Tracks;
using Buffer = OMSWeb.Models.Tracks.Buffer;
using OMSWeb.Models;

namespace OMSWeb.Repositories
{
    public class ModeStateRepository : DataAccess
    {
        public ModeStateRepository(IConfiguration configuration) : base(configuration)
        {
        }

        public IQueryable<ModeStateEntity> QueryModeState()
        {
            IQueryable<ModeStateEntity> result;

            var sql = @"SELECT comm_state, control_state, tsc_state, pm_state, ai_mode FROM mode_state";
            
            using (var conn = ConnectTrack())
            {
                result = conn.Query<ModeStateEntity>(sql).AsQueryable();
            }
            return result;
        }

        public ModeStateEntity GetModeState()
        {
            IQueryable<ModeStateEntity> modeStateEntity = this.QueryModeState();
            var list = modeStateEntity.Select(w => new ModeStateEntity
            {
                comm_state = w.comm_state,
                control_state = w.control_state,
                tsc_state = w.tsc_state,
                pm_state = w.pm_state,
                ai_mode = w.ai_mode

            }).ToList();

            if (list.Count > 0)
                return list[0];

            return null;
        }
    }
}