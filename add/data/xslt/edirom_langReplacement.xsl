<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.tei-c.org/ns/1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:eof="http://www.edirom.de/xslt/ediromOnlineFunctions" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" exclude-result-prefixes="#default xs tei" version="3.0">

    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Jul 17, 2013</xd:p>
            <xd:p>
                <xd:b>Author:</xd:b> Daniel Röwenstrunk</xd:p>
            <xd:p/>
        <xd:p>Modified by Benjamin W. Bohl on Aug 1, 2013</xd:p>
        </xd:desc>
    </xd:doc>

    <xsl:output encoding="UTF-8"/>
    <xsl:param name="lang"/>
    <xsl:param name="base" as="xs:string"/>

    <xsl:param name="projectLangPath" as="xs:string">none</xsl:param>

    <xsl:variable name="ediromLang">
        <xsl:choose>
            <xsl:when test="doc-available(concat($base, '../locale/edirom-lang-', $lang, '.xml'))">
                <xsl:copy-of select="document(concat($base, '../locale/edirom-lang-', $lang, '.xml'))"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy-of select="document(concat($base, '../locale/edirom-lang-en.xml'))"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

    <xsl:variable name="projectLang">
        <xsl:choose>
            <xsl:when test="$projectLangPath = 'none'"/>
            <xsl:otherwise>
                <xsl:if test="doc-available(concat($base,$projectLangPath))">
                    <xsl:copy-of select="document(concat($base,$projectLangPath))"/>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

    <xsl:template match="/">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="tei:term[@type='ediromGui']">
        <xsl:copy>
            <xsl:apply-templates/>
        <xsl:value-of select="eof:getLangValue(@key)"/>
    </xsl:copy>
    </xsl:template>

    <xsl:function name="eof:getLangValue">
        <xsl:param name="key"/>
        <xsl:variable name="value" select="if($projectLang//entry[@key = $key]) then($projectLang//entry[@key = $key]/@value) else($ediromLang//entry[@key = $key]/@value)"/>
        <xsl:choose>
            <xsl:when test="$value">
                <xsl:analyze-string select="$value" regex="\{{key=([^}}]*)\}}">
                    <xsl:matching-substring>
                        <blA>
                            <xsl:value-of select="eof:getLangValue(regex-group(1))"/>
                        </blA>
                    </xsl:matching-substring>
                    <xsl:non-matching-substring>
                        <xsl:value-of select="."/>
                    </xsl:non-matching-substring>
                </xsl:analyze-string>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>[[missing langVar: </xsl:text>
                <xsl:value-of select="$key"/>
            <xsl:text>]]</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>

    <xsl:template match="node() | @* | comment() | processing-instruction()">
        <xsl:copy>
            <xsl:apply-templates select="@* | node()"/>
        </xsl:copy>
    </xsl:template>

</xsl:stylesheet>