interface AttributionProps {
  appName?: string
}

export function Attribution({ appName }: AttributionProps) {
  return (
    <>
      ✨ Part of{' '}
      <a
        href="https://github.com/akhy/sparklings"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800"
      >
        Sparklings
      </a>
      {appName && (
        <>
          {' '}(<a
            href={`https://github.com/akhy/sparklings/tree/main/apps/${appName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            source code
          </a>)
        </>
      )}
    </>
  )
}