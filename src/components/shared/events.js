const eventsName = [
  'AfterExport',
  'AfterPlot',
  'Animated',
  'AnimatingFrame',
  'AnimationInterrupted',
  'AutoSize',
  'BeforeExport',
  'ButtonClicked',
  'Click',
  'ClickAnnotation',
  'Deselect',
  'DoubleClick',
  'Framework',
  'Hover',
  'LegendClick',
  'LegendDoubleClick',
  'Relayout',
  'Restyle',
  'Redraw',
  'Selected',
  'Selecting',
  'SliderChange',
  'SliderEnd',
  'SliderStart',
  'Transitioning',
  'TransitionInterrupted',
  'Unhover'
]

const events = eventsName
  .map(evt => evt.toLocaleLowerCase())
  .map(eventName => ({
    completeName: 'plotly_' + eventName,
    handler: context => (...args) => {
      // eslint-disable-next-line no-useless-call
      context.$emit.apply(context, [eventName, ...args])
    }
  }))

export default events
