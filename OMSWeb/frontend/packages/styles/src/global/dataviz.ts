import { css } from '@emotion/react'

const dataviz = css`
.tooltip {
  visibility: hidden;
  pointer-events: none;

  &-title {
    font-weight: bold;
  }

  dl {
    display: flex;
    max-width: 200px;
    opacity: 0.85;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    pointer-events: none;

    &:last-of-type {
      border-bottom: none;
    }

    dt {
      min-width: 30px;
      max-width: 100px;
      margin-right: 10px;
      flex-shrink: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    dd {
      flex: 1 1 auto;
    }
  }
}

.legend {
  z-index: 1000;

  &-list {

  }

  &-item {
    display: block;

    text {
      fill: white;
      font-size: 12;
    }
  }
}

.grid {
  pointer-events: none;
  z-index: 1;

  .domain {
    display: none;
  }

  .tick {
    color: white;
    opacity: 0.2;

    &:first-of-type {
      display: none;
    }

  }
}

.axis {
  pointer-events: none;
}

.yAxis {
  .domain {
    display: none;
  }
  .tick {
    line {
      display: none;
    }
  }
}

g.paths {
  z-index: 2;
}

div.sync-chart {
  display: flex;
  flex-wrap: wrap;

  /* * > div {
    margin-bottom: 30px;
  } */
}
`

export default dataviz