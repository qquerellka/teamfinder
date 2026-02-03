import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/github-dark.css';
import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { SText } from './SText';

hljs.registerLanguage('python', python);

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: FC<CodeBlockProps> = ({ code, language = 'python' }) => {
  const highlighted = useMemo(() => {
    return hljs.highlight(code, { language }).value;
  }, [code, language]);

  return (
    <Container>
      <Pre className="hljs">
        <Code dangerouslySetInnerHTML={{ __html: highlighted }} $fs={16} />
      </Pre>
    </Container>
  );
};

const Container = styled.div`
  overflow-x: auto;
`;

const Pre = styled(SText)`
  margin: 0;
  background: var(--tg-theme-bg-color);
  white-space: pre;
`;

const Code = styled(SText)`
  display: block;
`;
