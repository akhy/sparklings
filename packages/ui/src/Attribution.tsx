interface AttributionProps {
  appName?: string
}

export function Attribution({ appName }: AttributionProps) {
  return (
    <>
      ✨ Part of{' '}
      <a
        href="https://github.com/chickenzord/sparklings"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800"
      >
        Sparklings
      </a>
      {' '}by{' '}
      <a
        href="https://github.com/akhy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800"
      >
        akhy
      </a>
      {appName && (
        <>
          {' '}(
          <a
            href={`https://github.com/chickenzord/sparklings/tree/main/apps/${appName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            source code
          </a>
          )
        </>
      )}
    </>
  )
}
