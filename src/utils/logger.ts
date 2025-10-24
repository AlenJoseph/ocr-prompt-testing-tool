import chalk from 'chalk';

/**
 * Log info message
 */
export function logInfo(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Log success message
 */
export function logSuccess(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Log warning message
 */
export function logWarning(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Log error message
 */
export function logError(message: string): void {
  console.log(chalk.red('✗'), message);
}

/**
 * Log debug message (only in debug mode)
 */
export function logDebug(message: string): void {
  if (process.env.DEBUG === 'true') {
    console.log(chalk.gray('🐛'), message);
  }
}

/**
 * Log section header
 */
export function logHeader(message: string): void {
  console.log('\n' + chalk.bold.cyan(message));
  console.log(chalk.cyan('='.repeat(message.length)) + '\n');
}