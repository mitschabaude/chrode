import {BuildOptions} from 'esbuild';

export {run, build};

declare function run(
  scriptPath: string,
  options?: {
    silent: boolean;
    verbose: boolean;
    noHeadless: boolean;
    incognito: boolean;
    watch: boolean;
  }
): Promise<void>;

declare function build(
  scriptPath: string,
  extraConfig: Partial<BuildOptions>
): Promise<string>;
